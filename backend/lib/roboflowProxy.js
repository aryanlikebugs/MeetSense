import axios from 'axios';
import FormData from 'form-data';
import pLimit from 'p-limit';

// Read from environment
const ROBOFLOW_INFERENCE_URL = process.env.ROBOFLOW_INFERENCE_URL;
const ROBOFLOW_API_KEY = process.env.ROBOFLOW_API_KEY;
const MAX_CONCURRENT_REQUESTS = parseInt(process.env.MAX_CONCURRENT_ROBOFLOW_REQUESTS || '3');

// Create concurrency limiter
const limit = pLimit(MAX_CONCURRENT_REQUESTS);

async function sendToRoboflow(imageBuffer, retryCount = 0) {
  // If Roboflow is not configured, return an empty result so the
  // API can succeed without crashing in development.
  if (!ROBOFLOW_INFERENCE_URL || !ROBOFLOW_API_KEY) {
    console.warn('[Roboflow] ROBOFLOW_INFERENCE_URL or ROBOFLOW_API_KEY not set. Skipping remote detection.');
    return { predictions: [] };
  }

  const form = new FormData();
  form.append('file', imageBuffer, {
    filename: 'frame.jpg',
    contentType: 'image/jpeg',
  });

  const url = `${ROBOFLOW_INFERENCE_URL}?api_key=${ROBOFLOW_API_KEY}`;
  
  try {
    const response = await axios.post(url, form, {
      headers: {
        ...form.getHeaders(),
      },
      timeout: 10000, // 10s timeout
    });
    
    return response.data;
  } catch (error) {
    // Retry once on network errors with backoff
    if (retryCount < 1 && (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT')) {
      const backoff = retryCount === 0 ? 300 : 900;
      await new Promise(resolve => setTimeout(resolve, backoff));
      return sendToRoboflow(imageBuffer, retryCount + 1);
    }
    
    throw error;
  }
}

export default {
  detect: (imageBuffer) => limit(() => sendToRoboflow(imageBuffer)),
  isFull: () => limit.activeCount >= MAX_CONCURRENT_REQUESTS
};
