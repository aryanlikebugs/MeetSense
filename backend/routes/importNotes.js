import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { protect } from '../middleware/authMiddleware.js';
import AINote from '../models/AINote.js';
import mongoose from 'mongoose';

const router = express.Router();

/**
 * Import existing JSON notes files into MongoDB
 * POST /api/import-notes/:meetingId
 */
router.post('/import-notes/:meetingId', protect, async (req, res) => {
  try {
    const { meetingId } = req.params;
    
    // Check if meeting ID is valid
    if (!meetingId) {
      return res.status(400).json({ error: 'Meeting ID is required' });
    }
    
    // Convert string meetingId to ObjectId if needed
    const meetingObjId = mongoose.Types.ObjectId.isValid(meetingId) 
      ? new mongoose.Types.ObjectId(meetingId) 
      : meetingId;

    // Check if notes file exists
    const transcriptsDir = path.resolve(process.cwd(), 'backend', 'transcripts');
    const notesFilePath = path.join(transcriptsDir, `${meetingId}.notes.json`);
    
    try {
      await fs.access(notesFilePath);
    } catch (error) {
      return res.status(404).json({ error: 'Notes file not found' });
    }
    
    // Read the notes file
    const notesContent = await fs.readFile(notesFilePath, 'utf8');
    const notesData = JSON.parse(notesContent);
    
    // Create a new AINote document with the structured data
    const aiNote = new AINote({
      meetingId: meetingObjId,
      title: notesData.title || 'Meeting Notes',
      summary: notesData.summary || '',
      decisions: notesData.decisions || [],
      action_items: notesData.action_items || [],
      key_timestamps: notesData.key_timestamps || [],
      transcript_snippets: notesData.transcript_snippets || [],
      confidence: notesData.confidence || 'medium',
      createdBy: req.user._id,
      rawContent: notesContent
    });
    
    // Save the notes to MongoDB
    const savedNote = await aiNote.save();
    
    return res.json({
      success: true,
      message: 'Notes imported successfully',
      noteId: savedNote._id
    });
  } catch (error) {
    console.error('Error importing notes:', error);
    return res.status(500).json({ error: 'Failed to import notes' });
  }
});

export default router;
