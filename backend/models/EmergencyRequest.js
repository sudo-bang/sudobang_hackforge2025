import mongoose from 'mongoose';
const emergencyRequestSchema = new mongoose.Schema({
  userId: { type: String }, // Clerk user ID
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: [Number], // longitude, latitude
  },
  status: {
    type: String,
    enum: ['pending', 'ambulance_accepted', 'hospital_accepted', 'picked', 'arrived'],
    default: 'pending',
  },
  ambulanceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ambulance' },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
  updates: [
    {
      type: { type: String },
      data: mongoose.Schema.Types.Mixed,
      timestamp: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('EmergencyRequest', emergencyRequestSchema);