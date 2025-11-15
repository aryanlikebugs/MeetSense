import mongoose from 'mongoose';

const timestampSchema = new mongoose.Schema({
  ts: String,
  note: String
}, { _id: false });

const aiNoteSchema = new mongoose.Schema({
  meetingId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Meeting', 
    required: true 
  },
  // Structured content fields
  title: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    required: true
  },
  decisions: {
    type: [{
      decision: String,
      by: String,
      timestamp: String
    }],
    default: []
  },
  action_items: {
    type: [{
      task: String,
      owner: String,
      due: String,
      context: String
    }],
    default: []
  },
  key_timestamps: {
    type: [timestampSchema],
    default: []
  },
  transcript_snippets: {
    type: [String],
    default: []
  },
  confidence: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  // Metadata fields
  generatedAt: { 
    type: Date, 
    default: Date.now 
  },
  prompt: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Original JSON content for backup
  rawContent: {
    type: String
  }
});

// Add index for faster queries
aiNoteSchema.index({ meetingId: 1 });

export default mongoose.model('AINote', aiNoteSchema);
