import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  text: { type: String, required: true },
  ts: { type: Date, default: Date.now }
});

const participantSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  joinTimes: { type: [Date], default: [] },
  leaveTimes: { type: [Date], default: [] },
  reconnectCount: { type: Number, default: 0 }
});

const meetingSchema = new mongoose.Schema({
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  topic: { type: String, required: true },
  participants: [participantSchema],
  messages: [messageSchema],
  createdAt: { type: Date, default: Date.now },
  endedAt: { type: Date }
});

export default mongoose.model('Meeting', meetingSchema);
