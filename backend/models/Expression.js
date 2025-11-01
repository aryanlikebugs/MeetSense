import mongoose from 'mongoose';

const expressionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  meetingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Meeting' },
  timestamp: { type: Date, default: Date.now },
  emotion: { type: String },
  snapshotUrl: { type: String } // for image or frame data
});

export default mongoose.model('Expression', expressionSchema);
