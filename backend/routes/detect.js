import express from 'express';
import multer from 'multer';
import roboflowProxy from '../lib/roboflowProxy.js';
import Emotion from '../models/Emotion.js';

const router = express.Router();

// Configure multer to store files in memory
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.post('/frame', upload.single('frame'), async (req, res) => {
  try {
    // Check if we have the required fields
    if (!req.file || !req.body.meetingId) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Missing required fields (frame, meetingId)' 
      });
    }

    // Check if we're at concurrency limit
    if (roboflowProxy.isFull()) {
      return res.status(429).json({ 
        ok: false, 
        error: 'Too many concurrent requests' 
      });
    }
    
    const meetingId = req.body.meetingId;
    const frameId = req.body.frameId ? parseInt(req.body.frameId) : null;
    
    // Send to Roboflow
    const result = await roboflowProxy.detect(req.file.buffer);
    
    // Process predictions
    const predictions = [];
    const timestamp = Date.now();
    
    if (result && result.predictions) {
      for (const pred of result.predictions) {
        // Map Roboflow response to our schema
        const emotion = {
          meeting_id: meetingId,
          timestamp: timestamp,
          bbox: {
            x: pred.x || 0,
            y: pred.y || 0,
            w: pred.width || 0,
            h: pred.height || 0
          },
          emotion: pred.class || 'unknown',
          confidence: pred.confidence || 0,
          frame_id: frameId
        };
        
        // Save to DB
        //const emotionDoc = new Emotion(emotion);
        //await emotionDoc.save();
        // Replace with
try {
  const emotionDoc = new Emotion(emotion);
  await emotionDoc.save();
  console.log(`[Emotion] Saved emotion for meeting ${meetingId}: ${emotion.emotion} (${emotion.confidence})`);
} catch (err) {
  console.error(`[Emotion] Error saving emotion to DB:`, err);
}
        
        // Add to response
        predictions.push(emotion);
        
        // Emit socket event
        req.app.io.to(meetingId).emit('emotion_event', emotion);
      }
    }
    
    return res.json({ ok: true, predictions });
  } catch (error) {
    console.error('Error processing frame:', error);
    return res.status(500).json({ 
      ok: false, 
      error: 'Server error processing frame' 
    });
  }
});

export default router;
