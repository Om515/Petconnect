import mongoose from 'mongoose';

const connectionRequestSchema = new mongoose.Schema({
    requester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    pet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PetOrder',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    message: {
        type: String,
        default: ''
    },
    respondedAt: {
        type: Date
    }
}, { timestamps: true });

connectionRequestSchema.index(
    { requester: 1, pet: 1 },
    { 
        unique: true, 
        partialFilterExpression: { status: { $in: ['pending', 'accepted'] } } 
    }
);

const ConnectionRequest = mongoose.model('ConnectionRequest', connectionRequestSchema);
export default ConnectionRequest;
