import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Check, X, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Notifications = () => {
    const [requests, setRequests] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchData = async () => {
        try {
            const [reqRes, notifRes] = await Promise.all([
                axios.get('/api/chat/requests/received'),
                axios.get('/api/chat/notifications')
            ]);
            
            if (reqRes.data.success) {
                setRequests(reqRes.data.requests);
            }
            if (notifRes.data.success) {
                // Filter out 'new_message' so they only show in chat, not general notifications pane
                setNotifications(notifRes.data.notifications.filter(n => n.type !== 'new_message'));
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to fetch notifications");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRespond = async (id, action) => {
        try {
            const res = await axios.patch(`/api/chat/requests/${id}/respond`, { action });
            if (res.data.success) {
                toast.success(`Request ${action}ed successfully`);
                fetchData(); // Refresh UI
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || `Failed to ${action} request`);
        }
    };

    const markAsRead = async (id) => {
        try {
            await axios.patch(`/api/chat/notifications/${id}/read`);
            fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) {
        return (
            <div className="bg-gray-50 min-h-[calc(100vh-80px)]">
                <div className="flex justify-center items-center h-64">
                    <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    const pendingRequests = requests.filter(r => r.status === 'pending');

    return (
        <div className="bg-gray-50 min-h-[calc(100vh-80px)]">
            <div className="max-w-4xl mx-auto py-10 px-4">
                <div className="flex items-center mb-8 gap-3">
                    <Bell className="text-cyan-500 w-8 h-8" />
                    <h1 className="text-3xl font-bold text-gray-800">Notifications & Requests</h1>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                    <div className="bg-cyan-50/50 p-4 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-800">Incoming Requests ({pendingRequests.length})</h2>
                        <p className="text-sm text-gray-500">People who want to care for or adopt your pets</p>
                    </div>
                    
                    <div className="p-4">
                        {pendingRequests.length === 0 ? (
                            <p className="text-gray-500 text-center py-6 text-sm">You have no pending requests.</p>
                        ) : (
                            <ul className="space-y-4">
                                {pendingRequests.map((req) => (
                                    <li key={req._id} className="flex flex-col md:flex-row items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="flex items-center gap-4 mb-4 md:mb-0">
                                            <div className="w-12 h-12 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center font-bold text-lg">
                                                {req.requester?.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800 text-sm">
                                                    <span className="font-bold">{req.requester?.name}</span> requested to adopt <span className="font-bold text-cyan-600">{req.pet?.breed}</span>
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">{new Date(req.createdAt).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 w-full md:w-auto">
                                            <button 
                                                onClick={() => handleRespond(req._id, 'accept')}
                                                className="flex-1 md:flex-none flex items-center justify-center bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                            >
                                                <Check className="w-4 h-4 mr-1" /> Accept
                                            </button>
                                            <button 
                                                onClick={() => handleRespond(req._id, 'reject')}
                                                className="flex-1 md:flex-none flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                            >
                                                <X className="w-4 h-4 mr-1" /> Reject
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gray-50/50 p-4 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-800">All Notifications</h2>
                    </div>
                    <div className="p-4">
                        {notifications.length === 0 ? (
                            <p className="text-gray-500 text-center py-6 text-sm">No notifications found.</p>
                        ) : (
                            <ul className="space-y-3">
                                {notifications.map(n => (
                                    <li 
                                        key={n._id} 
                                        className={`p-4 rounded-xl text-sm border cursor-pointer transition-colors ${n.read ? 'bg-white border-gray-100' : 'bg-cyan-50 border-cyan-100'}`}
                                        onClick={() => markAsRead(n._id)}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-gray-800 mb-1">
                                                    {n.type === 'request_received' && `You received a request for ${n.pet?.breed}.`}
                                                    {n.type === 'request_accepted' && `Your request for ${n.pet?.breed} was accepted!`}
                                                    {n.type === 'request_rejected' && `Your request for ${n.pet?.breed} was declined.`}
                                                    {n.type === 'new_message' && `New message from ${n.relatedUser?.name}.`}
                                                </p>
                                                <p className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleString()}</p>
                                            </div>
                                            {!n.read && <span className="w-2.5 h-2.5 bg-cyan-500 rounded-full"></span>}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Notifications;
