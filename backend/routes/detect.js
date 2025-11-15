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
    
    const meetingId = req.body.meetingId;
    const frameId = req.body.frameId ? parseInt(req.body.frameId) : null;
    const timestamp = Date.now();

    // Shared predictions array for this frame
    const predictions = [];

    // Helper to create a neutral fallback emotion when Roboflow returns
    // no predictions or cannot be reached. This still stores to Mongo
    // and emits a socket event so the frontend has data to show.
    const createFallbackEmotion = async () => {
      const fallbackEmotion = {
        meeting_id: meetingId,
        timestamp,
        bbox: { x: 0, y: 0, w: 0, h: 0 },
        emotion: 'neutral',
        confidence: 0.5,
        frame_id: frameId
      };

      try {
        const emotionDoc = new Emotion(fallbackEmotion);
        await emotionDoc.save();
        console.log(`[Emotion] Saved fallback neutral emotion for meeting ${meetingId}`);
      } catch (err) {
        console.error('[Emotion] Error saving fallback emotion to DB:', err);
      }

      predictions.push(fallbackEmotion);
      req.app.io.to(meetingId).emit('emotion_event', fallbackEmotion);
    };

    // If we're at concurrency limit, skip remote detection but still create
    // a fallback emotion so analytics and UI continue to update.
    if (roboflowProxy.isFull()) {
      console.warn(`[Emotion] Skipping Roboflow for meeting ${meetingId} due to concurrency limit, using fallback emotion`);
      await createFallbackEmotion();
      return res.json({ ok: true, predictions });
    }

    let result;
    try {
      // Send to Roboflow (or fallback)
      result = await roboflowProxy.detect(req.file.buffer);
    } catch (error) {
      console.error('Error processing frame (Roboflow error):', error);
      await createFallbackEmotion();
      return res.json({ 
        ok: false, 
        error: 'Server error processing frame',
        predictions
      });
    }

    // Process predictions from Roboflow if present
    if (result && result.predictions) {
      for (const pred of result.predictions) {
        const emotion = {
          meeting_id: meetingId,
          timestamp,
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

        try {
          const emotionDoc = new Emotion(emotion);
          await emotionDoc.save();
          console.log(`[Emotion] Saved emotion for meeting ${meetingId}: ${emotion.emotion} (${emotion.confidence})`);
        } catch (err) {
          console.error('[Emotion] Error saving emotion to DB:', err);
        }

        predictions.push(emotion);
        req.app.io.to(meetingId).emit('emotion_event', emotion);
      }
    }

    // If Roboflow returned no predictions, still create a neutral fallback
    if (predictions.length === 0) {
      await createFallbackEmotion();
    }

    return res.json({ ok: true, predictions });
  } catch (error) {
    console.error('Error processing frame:', error);
    return res.json({ 
      ok: false, 
      error: 'Server error processing frame',
      predictions: []
    });
  }
});

export default router;
