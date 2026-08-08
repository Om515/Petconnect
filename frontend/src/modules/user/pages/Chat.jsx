import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Send, ArrowLeft, MessageCircle, CheckCheck, Calendar, Paperclip, X, Trash2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { AuthData } from '../../../context/AuthContext';

const Chat = () => {
    const { user } = AuthData();
    const location = useLocation();
    const targetConvoId = location.state?.conversationId;
    const [conversations, setConversations] = useState([]);
    const [activeConvo, setActiveConvo] = useState(null);
    const [messages, setMessages] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [firstUnreadId, setFirstUnreadId] = useState(null);
    const [input, setInput] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);
    const [socket, setSocket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [partnerStatus, setPartnerStatus] = useState({ isOnline: false, lastSeen: null });
    const [partnerTyping, setPartnerTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const activeConvoRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    useEffect(() => {
        activeConvoRef.current = activeConvo;
    }, [activeConvo]);

    // Fetch conversations on load
    useEffect(() => {
        axios.get("/api/chat/conversations").then((res) => {
            if (res.data.success) {
                const convos = res.data.conversations || [];
                setConversations(convos);
                if (targetConvoId) {
                    const match = convos.find(c => c._id === targetConvoId);
                    if (match) {
                        setActiveConvo(match);
                    }
                }
            }
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, [targetConvoId]);

    // Initialize Socket
    useEffect(() => {
        if (!user) return;
        const newSocket = io("http://localhost:7001", {
            withCredentials: true
        });
        setSocket(newSocket);

        newSocket.on("new_message", (data) => {
            setMessages((prev) => [...prev, data.message]);
            // If the message is for the current active conversation, auto-mark it as read
            if (activeConvoRef.current?._id === data.message.conversationId) {
                newSocket.emit("mark_as_read", { conversationId: data.message.conversationId });
                // We timeout shortly so the backend has time to update DB before Navbar fetches
                setTimeout(() => window.dispatchEvent(new Event('messages_read')), 100);
            }
        });

        newSocket.on("chat_messages_read", (data) => {
            setMessages(prev => prev.map(m => {
                if (m.conversationId === data.conversationId && m.sender === user._id) {
                    return { ...m, readBy: [/* populated safely to trigger length > 0 */ 'read'] };
                }
                return m;
            }));
        });

        newSocket.on("incoming_message", (data) => {
            if (activeConvoRef.current?._id === data.conversationId) return;
            
            setConversations(prev => prev.map(c => {
                if (c._id === data.conversationId) {
                    return { ...c, unreadCount: (c.unreadCount || 0) + 1 };
                }
                return c;
            }));
            // triggers navbar background fetch
            window.dispatchEvent(new Event('messages_read')); 
        });
        
        return () => newSocket.disconnect();
    }, [user]);

    // Fetch Messages when a conversation is selected
    useEffect(() => {
        if (!activeConvo || !socket) return;
        
        socket.emit("join_conversation", activeConvo._id);

        const otherUserId = activeConvo.participants.find(p => p._id !== user?._id)?._id;
        if (otherUserId) {
            socket.emit("check_status", otherUserId);
        }

        const handleStatusResponse = (data) => {
            if (data.userId === otherUserId) setPartnerStatus({ isOnline: data.isOnline, lastSeen: data.lastSeen });
        };
        const handleUserOnline = (userId) => {
            if (userId === otherUserId) setPartnerStatus({ isOnline: true, lastSeen: null });
        };
        const handleUserOffline = (data) => {
            if (data.userId === otherUserId) setPartnerStatus({ isOnline: false, lastSeen: data.lastSeen });
        };

        const handleMessagesRead = (data) => {
            if (data.conversationId === activeConvo._id) {
                setMessages(prev => prev.map(m => m.sender === user._id ? { ...m, readBy: ['read'] } : m));
            }
        };

        const handleUserTyping = (data) => {
            if (data.userId === otherUserId) setPartnerTyping(true);
        };
        
        const handleUserStoppedTyping = (data) => {
            if (data.userId === otherUserId) setPartnerTyping(false);
        };
        
        const handleMessageDeleted = (data) => {
            setMessages(prev => prev.map(m => m._id === data.messageId ? { ...m, isDeleted: true, text: "🚫 This message was deleted", imageUrl: null } : m));
        };

        socket.on("status_response", handleStatusResponse);
        socket.on("user_online", handleUserOnline);
        socket.on("user_offline", handleUserOffline);
        socket.on("chat_messages_read", handleMessagesRead);
        socket.on("user_typing", handleUserTyping);
        socket.on("user_stopped_typing", handleUserStoppedTyping);
        socket.on("message_deleted", handleMessageDeleted);

        setPage(1);
        setHasMore(true);

        axios.get(`/api/chat/conversations/${activeConvo._id}/messages?page=1&limit=50`).then(res => {
            if (res.data.success) {
                setMessages(res.data.messages);
                setFirstUnreadId(res.data.firstUnreadId || null);
                setHasMore(res.data.messages.length === 50);
                
                // Allow DOM to update before scrolling
                setTimeout(() => {
                    if (res.data.firstUnreadId) {
                        document.getElementById('unread-boundary')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    } else {
                        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
                    }
                }, 100);
                
                window.dispatchEvent(new Event('messages_read'));
            }
        });

        return () => {
            socket.emit("leave_conversation", activeConvo._id);
            socket.off("status_response", handleStatusResponse);
            socket.off("user_online", handleUserOnline);
            socket.off("user_offline", handleUserOffline);
            socket.off("chat_messages_read", handleMessagesRead);
            socket.off("user_typing", handleUserTyping);
            socket.off("user_stopped_typing", handleUserStoppedTyping);
            socket.off("message_deleted", handleMessageDeleted);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            setPartnerTyping(false);
        };
    }, [activeConvo, socket]);

    const formatLastSeen = (dateString) => {
        if (!dateString) return 'offline';
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return `last seen today at ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
        } else if (diffDays === 1) {
            return `last seen yesterday at ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
        } else {
            return `last seen on ${date.toLocaleDateString()}`;
        }
    };

    const isDifferentDay = (date1, date2) => {
        if (!date1) return true; // First message always shows date
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        return d1.toDateString() !== d2.toDateString();
    };

    const formatChatDate = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric', year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined });
    };

    const handleScroll = async (e) => {
        if (e.target.scrollTop === 0 && hasMore) {
            const container = e.target;
            const previousHeight = container.scrollHeight;
            const nextPage = page + 1;
            
            try {
                const res = await axios.get(`/api/chat/conversations/${activeConvo._id}/messages?page=${nextPage}&limit=50`);
                if (res.data.success) {
                    const newMessages = res.data.messages;
                    if (newMessages.length < 50) setHasMore(false);
                    
                    setMessages(prev => [...newMessages, ...prev]);
                    setPage(nextPage);
                    
                    // Maintain scroll position flawlessly
                    requestAnimationFrame(() => {
                        container.scrollTop = container.scrollHeight - previousHeight;
                    });
                }
            } catch (err) {
                console.error("Pagination error:", err);
            }
        }
    };

    // Scroll to bottom only when new messages are sent/received while chatting
    useEffect(() => {
        // If we are actively chatting and a new message arrives, auto-scroll to bottom.
        // We only do this if it's the latest message (firstUnreadId is managed per conversation load)
        if (!firstUnreadId || messages[messages.length - 1]?.sender === user?._id) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, firstUnreadId, user]);

    const handleInputChange = (e) => {
        setInput(e.target.value);
        if (!socket || !activeConvo) return;
        
        socket.emit("typing", { conversationId: activeConvo._id });
        
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit("stop_typing", { conversationId: activeConvo._id });
        }, 1500);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if ((!input.trim() && !imageFile) || !activeConvo || !socket) return;

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        socket.emit("stop_typing", { conversationId: activeConvo._id });

        const tempMessage = {
            _id: Date.now().toString(),
            conversationId: activeConvo._id,
            sender: user._id,
            text: input,
            imageUrl: imagePreview,
            createdAt: new Date().toISOString()
        };

        // Optimistic UI update for sender
        setMessages(prev => [...prev, tempMessage]);
        
        const textData = input;
        setInput("");
        setImageFile(null);
        setImagePreview(null);

        // Only broadcast immediately if it is just text (no blobs!)
        if (!imageFile) {
            socket.emit("send_message", { conversationId: activeConvo._id, message: tempMessage });
        }
        
        try {
            let res;
            if (imageFile) {
                const formData = new FormData();
                formData.append('conversationId', activeConvo._id);
                if (textData) formData.append('text', textData);
                formData.append('file', imageFile);
                
                res = await axios.post("/api/chat/messages", formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                
                // Broadcast the real DB message containing the Cloudinary URL to the other user
                if (res.data?.success && res.data?.message) {
                    socket.emit("send_message", { conversationId: activeConvo._id, message: res.data.message });
                }
            } else {
                res = await axios.post("/api/chat/messages", { conversationId: activeConvo._id, text: textData });
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleMessageDelete = async (messageId) => {
        // Optimistic UI for unsend
        setMessages(prev => prev.map(m => m._id === messageId ? { ...m, isDeleted: true, text: "🚫 This message was deleted", imageUrl: null } : m));
        try {
            await axios.delete(`/api/chat/messages/${messageId}`);
        } catch (error) {
            console.error("Delete failed", error);
        }
    };

    if (loading) {
        return (
            <div className="bg-gray-50 min-h-screen flex flex-col">
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    return (
        <div 
            className="w-full relative" 
            style={{ 
                height: 'calc(100vh - 128px)', // Extact calculation: Top Navbar (80px) + Bottom Nav Links (48px) = 128px
                background: 'linear-gradient(135deg, #e0f2fe 0%, #ccfbf1 100%)'
            }}
        >
            <div className="max-w-6xl w-full mx-auto p-4 sm:p-6 flex gap-4 h-full overflow-hidden">
                
                {/* Sidebar (Conversations) */}
                <div className={`w-full md:w-1/3 bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 flex flex-col overflow-hidden ${activeConvo ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-4 border-b border-gray-100 bg-cyan-50/30">
                        <h2 className="text-lg font-bold text-gray-800">Your Chats</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {conversations.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 text-sm">
                                No conversations yet
                            </div>
                        ) : (
                            conversations.map(c => {
                                const otherUser = c.participants.find(p => p._id !== user?._id);
                                return (
                                    <div 
                                        key={c._id} 
                                        onClick={() => {
                                            setActiveConvo(c);
                                            setConversations(prev => prev.map(x => x._id === c._id ? { ...x, unreadCount: 0 } : x));
                                        }}
                                        className={`p-4 border-b border-gray-50 cursor-pointer transition-colors duration-200 flex items-center gap-3 ${activeConvo?._id === c._id ? 'bg-cyan-50' : 'hover:bg-gray-50'}`}
                                    >
                                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                                            {c.pet?.image?.url ? (
                                                <img src={c.pet.image.url} alt="Pet" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-cyan-100 flex items-center justify-center text-cyan-600 font-bold">{otherUser?.name?.charAt(0)}</div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-0.5">
                                                <h3 className="font-semibold text-gray-900 text-sm truncate">{otherUser?.name || 'Unknown'}</h3>
                                                {c.unreadCount > 0 && (
                                                    <span className="bg-teal-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ml-2 shadow-sm">
                                                        {c.unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 truncate">
                                                Re: {c.pet?.breed || 'Pet'}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className={`w-full md:w-2/3 bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/60 flex flex-col overflow-hidden ${!activeConvo ? 'hidden md:flex' : 'flex'}`}>
                    {!activeConvo ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                            <div className="w-24 h-24 bg-gradient-to-br from-cyan-100 to-teal-100 text-cyan-500 rounded-full flex items-center justify-center mb-6 shadow-sm">
                                <MessageCircle size={40} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 tracking-tight">Your Messages</h3>
                            <p className="text-gray-500 mt-2 max-w-sm">Select a conversation from the sidebar to continue chatting or start a new connection.</p>
                        </div>
                    ) : (
                        <>
                            {/* Chat Header */}
                            <div className="px-6 py-4 border-b border-gray-100/50 flex items-center gap-4 bg-white/50">
                                <button className="md:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors" onClick={() => setActiveConvo(null)}>
                                    <ArrowLeft size={20} />
                                </button>
                                <div className="w-10 h-10 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center font-bold text-lg">
                                    {activeConvo.participants.find(p => p._id !== user?._id)?.name?.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-800 text-lg leading-tight">
                                        {activeConvo.participants.find(p => p._id !== user?._id)?.name}
                                    </h3>
                                    <p className="text-xs font-medium tracking-wide flex items-center mt-0.5">
                                        {partnerStatus.isOnline ? (
                                            <span className="text-emerald-500 flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                                Online
                                            </span>
                                        ) : (
                                            <span className="text-gray-500">
                                                {formatLastSeen(partnerStatus.lastSeen)}
                                            </span>
                                        )}
                                        <span className="text-gray-300 mx-2">|</span>
                                        <span className="text-teal-600 uppercase">Re: {activeConvo.pet?.breed}</span>
                                    </p>
                                </div>
                            </div>
                            
                            {/* Messages Container */}
                            <div 
                                className="flex-1 overflow-y-auto p-4 sm:p-6"
                                onScroll={handleScroll}
                                style={{
                                    backgroundColor: '#e5ddd5',
                                    backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")',
                                    backgroundRepeat: 'repeat',
                                    backgroundSize: '400px',
                                    backgroundBlendMode: 'overlay'
                                }}
                            >
                                {page > 1 && hasMore && (
                                    <div className="w-full flex justify-center py-2">
                                        <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}
                                {messages.length === 0 ? (
                                    <p className="text-center text-sm text-gray-500 mt-4">No messages yet. Say hi!</p>
                                ) : (
                                    <div className="space-y-4">
                                        {messages.map((msg, index) => {
                                            const isSentByMe = msg.sender === user?._id;
                                            const isRead = msg.readBy && msg.readBy.length > 0;
                                            const showDateDivider = isDifferentDay(messages[index - 1]?.createdAt, msg.createdAt);
                                            return (
                                                <React.Fragment key={index}>
                                                    {showDateDivider && (
                                                        <div className="w-full flex justify-center my-5 group animate-in fade-in">
                                                            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-500 text-[11px] font-semibold px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5 transition-opacity">
                                                                <Calendar size={12} className="text-gray-400" />
                                                                {formatChatDate(msg.createdAt)}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {msg._id === firstUnreadId && (
                                                        <div id="unread-boundary" className="w-full flex justify-center my-6 relative">
                                                            <div className="absolute inset-0 flex items-center">
                                                                <div className="w-full border-t border-teal-200/50"></div>
                                                            </div>
                                                            <div className="relative flex justify-center">
                                                                <span className="bg-teal-50 text-teal-600 border border-teal-100 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                                                                    Unread Messages
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div 
                                                        className={`flex ${isSentByMe ? "justify-end" : "justify-start"} group animate-in fade-in slide-in-from-bottom-2 duration-300 mb-2 relative w-full`}
                                                    >
                                                        <div className="flex items-center max-w-[75%]">
                                                            {isSentByMe && !msg.isDeleted && (
                                                                <button 
                                                                    onClick={() => handleMessageDelete(msg._id)}
                                                                    className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2 mx-1 flex-shrink-0"
                                                                    title="Unsend for everyone"
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            )}
                                                            <div 
                                                                className={`w-full px-4 py-2.5 text-[15px] shadow-sm relative overflow-hidden rounded-2xl ${isSentByMe ? 'rounded-tr-sm' : 'rounded-tl-sm'} ${
                                                                    msg.isDeleted 
                                                                        ? "bg-gray-100/90 text-gray-400 italic border border-gray-200" 
                                                                        : (isSentByMe ? "bg-[#dcf8c6] text-gray-800" : "bg-white text-gray-800")
                                                                }`}
                                                            >
                                                                {msg.imageUrl && !msg.isDeleted && (
                                                                <div className="mb-2 -mx-2 -mt-1 rounded-t-xl overflow-hidden cursor-pointer" onClick={() => window.open(msg.imageUrl, '_blank')}>
                                                                    <img src={msg.imageUrl} alt="Attachment" className="max-w-[280px] w-full max-h-[300px] object-cover hover:opacity-90 transition-opacity" />
                                                                </div>
                                                            )}
                                                            {msg.text && (
                                                                <p className="whitespace-pre-wrap leading-relaxed pb-3 pr-2">{msg.text}</p>
                                                            )}
                                                            <div className="absolute right-2.5 bottom-1 flex items-center gap-1">
                                                                <span className={`text-[10px] font-medium opacity-60 ${isSentByMe ? 'text-teal-800' : 'text-gray-500'}`}>
                                                                    {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                                </span>
                                                                {isSentByMe && (
                                                                    <CheckCheck size={14} className={isRead ? 'text-blue-500' : 'text-gray-400 opacity-60'} />
                                                                )}
                                                            </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </React.Fragment>
                                            )
                                        })}
                                        <div ref={messagesEndRef} />
                                    </div>
                                )}
                                
                                {/* Typing Indicator Block */}
                                {partnerTyping && (
                                    <div className="flex justify-start mb-2 group animate-in fade-in slide-in-from-bottom-1 duration-200">
                                        <div className="bg-white text-gray-500 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-1.5 w-16 h-10 relative">
                                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {/* Input Area */}
                            {imagePreview && (
                                <div className="absolute bottom-[80px] left-8 bg-white p-2 rounded-xl shadow-lg border border-gray-100 animate-in slide-in-from-bottom-2">
                                    <div className="relative">
                                        <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />
                                        <button 
                                            onClick={() => { setImageFile(null); setImagePreview(null); }}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-sm"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                </div>
                            )}
                            <form onSubmit={sendMessage} className="p-3 sm:p-4 bg-gray-50 border-t border-gray-200 flex gap-2 items-center rounded-b-3xl relative">
                                <input 
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                                <button 
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-3 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-full transition-colors flex-shrink-0"
                                >
                                    <Paperclip size={24} />
                                </button>
                                <input 
                                    type="text" 
                                    className="flex-1 bg-white border border-gray-200 focus:border-teal-400 focus:ring-4 focus:ring-teal-100 rounded-full px-5 py-3 text-[15px] outline-none transition-all shadow-sm"
                                    placeholder={imageFile ? "Add a caption..." : "Type a message..."}
                                    value={input}
                                    onChange={handleInputChange}
                                />
                                <button 
                                    type="submit" 
                                    disabled={!input.trim() && !imageFile}
                                    className="bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300 transform active:scale-95 text-white w-12 h-12 rounded-full transition-all flex items-center justify-center shadow-md flex-shrink-0"
                                >
                                    <Send size={20} className="translate-x-0.5" />
                                </button>
                            </form>
                        </>
                    )}
                </div>

            </div>
        </div>
    );
}

export default Chat;
