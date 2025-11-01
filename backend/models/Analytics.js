import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  meetingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Meeting' },
  participants: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      activeTime: { type: Number, default: 0 }, // in seconds
      expressions: [{ type: String }]
    }
  ],
  metrics: mongoose.Schema.Types.Mixed // Placeholder for aggregated stats
});

export default mongoose.model('Analytics', analyticsSchema);
