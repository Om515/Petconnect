import ConnectionRequest from '../Models/connectionRequestModel.js';
import Conversation from '../Models/conversationModel.js';
import Message from '../Models/messageModel.js';
import Notification from "../Models/notificationModel.js";
import cloudinary from "cloudinary";
import getDataUrl from "../utils/urlGenerator.js";
import { petOrder } from '../Models/petModel.js';
import userModel from '../Models/userModel.js';
import { sendEmail } from '../utils/emailHelper.js';

export const createRequest = async (req, res) => {
    try {
        const { petId, message } = req.body;
        const requesterId = req.user._id;

        const pet = await petOrder.findById(petId);
        if (!pet) return res.status(404).json({ success: false, message: 'Pet not found' });

        if (pet.owner.toString() === requesterId.toString()) {
            return res.status(400).json({ success: false, message: 'Cannot request your own pet' });
        }

        // Check for existing request
        const existingRequest = await ConnectionRequest.findOne({
            requester: requesterId,
            pet: petId,
            status: { $in: ['pending', 'accepted'] }
        });

        if (existingRequest) {
            return res.status(400).json({ success: false, message: 'Request already exists' });
        }

        const newRequest = new ConnectionRequest({
            requester: requesterId,
            owner: pet.owner,
            pet: petId,
            message: message || ''
        });
        await newRequest.save();

        // Create notification for owner
        await Notification.create({
            user: pet.owner,
            type: 'request_received',
            relatedUser: requesterId,
            pet: petId,
            requestId: newRequest._id
        });

        res.status(201).json({ success: true, request: newRequest });

        // Fire asynchronous email
        const reqUser = await userModel.findById(requesterId);
        const ownerUser = await userModel.findById(pet.owner);
        sendEmail({
            to: ownerUser.email,
            subject: "New Request on PetConnect",
            html: `<p>Hello ${ownerUser.name},</p><p><b>${reqUser.name}</b> has sent a request to adopt your pet: <b>${pet.breed}</b>.</p><p>Please log in to your account to accept or reject this request.</p>`
        });
    } catch (error) {
        console.error("Create request error:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getReceivedRequests = async (req, res) => {
    try {
        const requests = await ConnectionRequest.find({ owner: req.user._id })
            .populate('requester', 'name email image')
            .populate('pet', 'breed category image price')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, requests });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getSentRequests = async (req, res) => {
    try {
        const requests = await ConnectionRequest.find({ requester: req.user._id })
            .populate('owner', 'name email image')
            .populate('pet', 'breed category image price')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, requests });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const respondToRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.body; // 'accept' or 'reject'
        
        const request = await ConnectionRequest.findById(id);
        if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
        
        if (request.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }
        
        if (request.status !== 'pending') {
            return res.status(400).json({ success: false, message: 'Request already processed' });
        }

        if (action === 'accept') {
            request.status = 'accepted';
            request.respondedAt = Date.now();
            await request.save();

            // Create Conversation
            const conversation = new Conversation({
                participants: [request.requester, request.owner],
                pet: request.pet,
                requestId: request._id
            });
            await conversation.save();

            // Notify requester
            await Notification.create({
                user: request.requester,
                type: 'request_accepted',
                relatedUser: request.owner,
                pet: request.pet,
                requestId: request._id,
                conversationId: conversation._id
            });

            // Fire asynchronous email
            const reqUser = await userModel.findById(request.requester);
            const ownerUser = await userModel.findById(request.owner);
            const petObj = await petOrder.findById(request.pet);
            sendEmail({
                to: reqUser.email,
                subject: "Your Request was Accepted!",
                html: `<p>Hello ${reqUser.name},</p><p><b>${ownerUser.name}</b> has accepted your request for <b>${petObj.breed}</b>!</p><p>You can now open the chat on PetConnect to arrange the details.</p>`
            });

            return res.status(200).json({ success: true, request, conversation });
        } else if (action === 'reject') {
            request.status = 'rejected';
            request.respondedAt = Date.now();
            await request.save();

            // Notify requester
            await Notification.create({
                user: request.requester,
                type: 'request_rejected',
                relatedUser: request.owner,
                pet: request.pet,
                requestId: request._id
            });
            
            // Fire asynchronous email
            const reqUser = await userModel.findById(request.requester);
            const petObj = await petOrder.findById(request.pet);
            sendEmail({
                to: reqUser.email,
                subject: "Update on your PetConnect Request",
                html: `<p>Hello ${reqUser.name},</p><p>Unfortunately, your request for <b>${petObj.breed}</b> was not accepted at this time.</p><p>Don't worry, there are many other pets looking for a loving home!</p>`
            });

            return res.status(200).json({ success: true, request });
        } else {
            return res.status(400).json({ success: false, message: 'Invalid action' });
        }
    } catch (error) {
        console.error("Respond request error:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getConversations = async (req, res) => {
    try {
        const conversations = await Conversation.find({ participants: req.user._id })
            .populate('participants', 'name email image')
            .populate('pet', 'breed category image price')
            .sort({ lastMessageAt: -1 });
            
        // Augment with unread counts
        const augmentedConversations = await Promise.all(conversations.map(async (convo) => {
            const unreadCount = await Notification.countDocuments({
                user: req.user._id,
                conversationId: convo._id,
                type: 'new_message',
                read: false
            });
            return {
                ...convo._doc,
                unreadCount
            };
        }));

        res.status(200).json({ success: true, conversations: augmentedConversations });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { id } = req.params;
        const conversation = await Conversation.findById(id);
        if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found' });
        
        if (!conversation.participants.includes(req.user._id)) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;

        // Find the boundary independently of the page chunk
        const firstUnreadMsg = await Message.findOne({
            conversationId: id,
            sender: { $ne: req.user._id },
            readBy: { $ne: req.user._id }
        }).sort({ createdAt: 1 }).lean();
        const firstUnreadId = firstUnreadMsg ? firstUnreadMsg._id : null;

        const rawMessages = await Message.find({ conversationId: id })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();
            
        const originalMessages = rawMessages.reverse();

        // Auto-mark any 'new_message' notifications for this conversation as read
        await Notification.updateMany({
            user: req.user._id,
            conversationId: id,
            type: 'new_message',
            read: false
        }, {
            read: true
        });

        // Mark Messages as read in DB
        if (firstUnreadId) {
            await Message.updateMany({
                conversationId: id,
                sender: { $ne: req.user._id }
            }, {
                $addToSet: { readBy: req.user._id }
            });
            
            const { getIO } = await import('../socket.js');
            const otherParticipants = conversation.participants.filter(p => p.toString() !== req.user._id.toString());
            otherParticipants.forEach(participantId => {
                try {
                    getIO().to(participantId.toString()).emit("chat_messages_read", { conversationId: id.toString() });
                } catch(e) {}
            });
        }
        
        // Safely tag them as newly read in the response payload for the frontend UI logic
        const messages = originalMessages.map(m => {
            if (m.sender.toString() !== req.user._id.toString() && !m.readBy?.map(x=>x.toString()).includes(req.user._id.toString())) {
                return { ...m, _isNewlyRead: true, readBy: [...(m.readBy || []), req.user._id] };
            }
            return m;
        });

        res.status(200).json({ success: true, messages, firstUnreadId });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const saveMessage = async (req, res) => {
    try {
        const { conversationId, text } = req.body;
        let imageUrl = undefined;
        
        // Handle file upload if present
        if (req.file) {
            const fileUrl = getDataUrl(req.file);
            const cloud = await cloudinary.uploader.upload(fileUrl.content, {
                folder: "petconnect_chat",
                resource_type: "image"
            });
            imageUrl = cloud.secure_url;
        }

        const newMessage = new Message({
            conversationId,
            sender: req.user._id,
            text,
            imageUrl
        });
        await newMessage.save();

        const convo = await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: text || (imageUrl ? "📷 Image" : ""),
            lastMessageAt: Date.now()
        });

        // Create Notification for the other participant(s) for EVERY message
        if (convo) {
            const otherParticipants = convo.participants.filter(p => p.toString() !== req.user._id.toString());
            const { getIO } = await import('../socket.js');
            for (const participantId of otherParticipants) {
                await Notification.create({
                    user: participantId,
                    type: 'new_message',
                    relatedUser: req.user._id,
                    pet: convo.pet,
                    conversationId: conversationId
                });
                
                try {
                    getIO().to(participantId.toString()).emit("incoming_message", { conversationId: conversationId.toString() });
                } catch(e) {
                    console.error("Socket emit failed", e);
                }
            }
        }

        res.status(201).json({ success: true, message: newMessage });
    } catch (error) {
        console.error("Save message error:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user._id })
            .populate('relatedUser', 'name image')
            .populate('pet', 'breed category image price')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const markNotificationRead = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findOneAndUpdate(
            { _id: id, user: req.user._id },
            { read: true },
            { new: true }
        );
        res.status(200).json({ success: true, notification });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const message = await Message.findById(id);

        if (!message) {
            return res.status(404).json({ success: false, message: "Message not found" });
        }

        if (message.sender.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized to delete this message" });
        }

        message.isDeleted = true;
        message.text = "?? This message was deleted";
        message.imageUrl = undefined;
        await message.save();

        const { getIO } = await import('../socket.js');
        try {
            getIO().to(message.conversationId.toString()).emit("message_deleted", { messageId: id, conversationId: message.conversationId });
        } catch (e) {
            console.error("Delete socket emit failed", e);
        }

        res.status(200).json({ success: true, message: "Message deleted" });
    } catch (error) {
        console.error("Delete message error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
