import express from "express";
import { 
    createRequest, 
    getReceivedRequests, 
    getSentRequests, 
    respondToRequest, 
    getConversations, 
    getMessages, 
    saveMessage,
    deleteMessage,
    getNotifications, 
    markNotificationRead 
} from "../Controllers/chatController.js";
import authenticate from "../Middlewares/authenticate.js"; 
import uploadFile from "../Middlewares/multer.js";

const router = express.Router();

router.use(authenticate(["user", "caretaker"])); // Protect all chat routes

// Requests
router.post('/requests', createRequest);
router.get('/requests/received', getReceivedRequests);
router.get('/requests/sent', getSentRequests);
router.patch('/requests/:id/respond', respondToRequest);

// Conversations & Messages
router.get('/conversations', getConversations);
router.get('/conversations/:id/messages', getMessages);
router.post('/messages', uploadFile, saveMessage);
router.delete('/messages/:id', deleteMessage);

// Notifications
router.get('/notifications', getNotifications);
router.patch('/notifications/:id/read', markNotificationRead);

export default router;
