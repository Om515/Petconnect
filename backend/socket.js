import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import userModel from "./Models/userModel.js";
import Message from "./Models/messageModel.js";

dotenv.config();

let io;

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:5173",
            credentials: true,
        },
    });

    // Authentication Middleware for Socket.io
    io.use((socket, next) => {
        let token = socket.handshake.auth?.token;
        
        // Try to get token from cookies as fallback
        if (!token && socket.handshake.headers.cookie) {
            const cookies = socket.handshake.headers.cookie.split(';');
            const tokenCookie = cookies.find(c => c.trim().startsWith('user_token=') || c.trim().startsWith('caretaker_token='));
            if (tokenCookie) {
                token = tokenCookie.split('=')[1];
            }
        }

        if (!token) {
            return next(new Error("Authentication error"));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = decoded; // { id: ... } from your JWT payload
            next();
        } catch (err) {
            next(new Error("Authentication error"));
        }
    });

    const onlineUsers = new Map();

    io.on("connection", (socket) => {
        console.log(`Socket connected: User ID ${socket.user.id}`);
        
        // Track online status
        onlineUsers.set(socket.user.id, socket.id);
        io.emit("user_online", socket.user.id);
        
        // 1. Join personal room to receive real-time notifications anywhere in the app
        socket.join(socket.user.id);

        // 2. Join specific conversation rooms when the chat window is opened
        socket.on("join_conversation", (conversationId) => {
            socket.join(conversationId);
            console.log(`User ${socket.user.id} joined conversation ${conversationId}`);
        });

        // 3. Leave conversation
        socket.on("leave_conversation", (conversationId) => {
            socket.leave(conversationId);
        });

        // 4. Send Message event. (Normally we save to DB first then emit here)
        socket.on("send_message", (data) => {
            // broadcast message to everyone else in the conversation room
            socket.to(data.conversationId).emit("new_message", data);
        });

        // 5. Typing Indicators
        socket.on("typing", (data) => {
            socket.to(data.conversationId).emit("user_typing", { userId: socket.user.id, conversationId: data.conversationId });
        });

        socket.on("stop_typing", (data) => {
            socket.to(data.conversationId).emit("user_stopped_typing", { userId: socket.user.id, conversationId: data.conversationId });
        });

        // Check user status
        socket.on("check_status", async (userId) => {
            if (onlineUsers.has(userId)) {
                socket.emit("status_response", { userId, isOnline: true });
            } else {
                try {
                    const u = await userModel.findById(userId).select("lastSeen");
                    socket.emit("status_response", { userId, isOnline: false, lastSeen: u?.lastSeen });
                } catch(e) {}
            }
        });
        
        socket.on("mark_as_read", async ({ conversationId }) => {
            try {
                // Mark messages read
                await Message.updateMany(
                    { conversationId, sender: { $ne: socket.user.id } }, 
                    { $addToSet: { readBy: socket.user.id } }
                );
                
                // Also critically mark DB notifications read to un-badge the Navbar instantly
                const Notification = (await import("./Models/notificationModel.js")).default;
                await Notification.updateMany(
                    { user: socket.user.id, conversationId, type: 'new_message', read: false },
                    { read: true }
                );
                
                socket.to(conversationId).emit("chat_messages_read", { conversationId });
            } catch(e) {}
        });

        socket.on("disconnect", async () => {
            console.log(`Socket disconnected: User ID ${socket.user.id}`);
            onlineUsers.delete(socket.user.id);
            
            const lastSeenTime = new Date();
            io.emit("user_offline", { userId: socket.user.id, lastSeen: lastSeenTime });
            
            try {
                await userModel.findByIdAndUpdate(socket.user.id, { lastSeen: lastSeenTime });
            } catch(e) {}
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};
