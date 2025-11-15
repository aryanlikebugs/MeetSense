import mongoose from 'mongoose';

const transcriptLineSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  username: { type: String, required: true },
  startMs: { type: Number, required: true },
  endMs: { type: Number, required: true },
  text: { type: String, required: true },
  isFinal: { type: Boolean, default: true }
});

const transcriptSchema = new mongoose.Schema({
  meetingId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Meeting',
    required: true,
    index: true
  },
  lines: [transcriptLineSchema],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Transcript', transcriptSchema);

