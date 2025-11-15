import express from 'express';
import Emotion from './models/Emotion.js';

const router = express.Router();

router.get('/emotion/:meetingId', async (req, res) => {
  try {
    const { meetingId } = req.params;
    
    const emotions = await Emotion.find({ meeting_id: meetingId })
      .sort({ timestamp: -1 })
      .limit(500);
      
    return res.json({ ok: true, emotions });
  } catch (error) {
    console.error('Error fetching emotions:', error);
    return res.status(500).json({ 
      ok: false, 
      error: 'Server error fetching emotions' 
    });
  }
});

router.get('/health', (req, res) => {
  res.json({ ok: true });
});

export default router;
