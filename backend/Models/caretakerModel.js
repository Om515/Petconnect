import mongoose from 'mongoose';


const caretakerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { timestamps: true });


const caretakerModel = mongoose.models.caretaker || mongoose.model('Caretaker', caretakerSchema);

export default caretakerModel