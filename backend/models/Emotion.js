import mongoose from 'mongoose';

const EmotionSchema = new mongoose.Schema({
  meeting_id: { type: String, index: true },
  timestamp: Number,
  participant_id: { type: String, default: null },
  bbox: { x: Number, y: Number, w: Number, h: Number },
  emotion: String,
  confidence: Number,
  frame_id: Number
});

export default mongoose.model('Emotion', EmotionSchema);
