import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    type: {
        type: String,
        enum: ['request_received', 'request_accepted', 'request_rejected', 'new_message'],
        required: true
    },
    relatedUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    pet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PetOrder'
    },
    requestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ConnectionRequest'
    },
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation'
    },
    read: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
