# MeetSense Emotion Detection

Real-time emotion detection for MeetSense using Roboflow Hosted Inference.

## How It Works

1. During meetings, webcam frames are captured and sent to the server
2. Server forwards frames to Roboflow for emotion analysis
3. Detected emotions are stored in MongoDB and sent to clients via socket.io
4. Real-time emotion dashboard shows individual and aggregate emotion stats

## Setup Instructions

### 1. Install Dependencies

```bash
# In the backend directory
cd backend
npm install axios form-data multer p-limit
```

### 2. Environment Variables

Make sure your `.env` file in the backend directory includes these variables:

```
# Roboflow Emotion Detection Configuration
ROBOFLOW_API_KEY=CWNsmqHCRTuxsOJTguJo
ROBOFLOW_INFERENCE_URL=https://detect.roboflow.com/classroom-lzi7f/emotion-57ymy/2
MAX_CONCURRENT_ROBOFLOW_REQUESTS=3
SAMPLE_EVERY_N_FRAMES=6
```

### 3. Running with Docker Compose

For isolated development/testing:

```bash
# Start the services
docker-compose -f docker-compose.emotion.yml up

# Rebuild if needed
docker-compose -f docker-compose.emotion.yml up --build

# Stop services
docker-compose -f docker-compose.emotion.yml down
```

## Frontend Integration

### 1. Add the EmotionDetection component to your Meeting page

```jsx
import EmotionDetection from '../components/EmotionDetection';

function MeetingPage() {
  // Your existing meeting page component
  
  return (
    <div>
      {/* Existing meeting UI */}
      
      {/* Add emotion detection */}
      <EmotionDetection />
    </div>
  );
}
```

### 2. Testing with curl

```bash
# Test the detection endpoint with a sample image
curl -v \
  -F "frame=@sample.jpg;type=image/jpeg" \
  -F "meetingId=demo" \
  -F "frameId=1" \
  http://localhost:5000/api/detect/frame
```

Expected response:
```json
{
  "ok": true,
  "predictions": [
    {
      "meeting_id": "demo",
      "timestamp": 1699999999999,
      "bbox": {"x":0,"y":0,"w":0,"h":0},
      "emotion": "happy",
      "confidence": 0.87,
      "frame_id": 1
    }
  ]
}
```

## API Reference

### Endpoints

#### 1. POST `/api/detect/frame` 
Send a webcam frame for emotion detection

**Request:** `multipart/form-data` 
- `frame` — JPEG image
- `meetingId` — meeting identifier
- `frameId` — optional sequential frame ID

**Response:**
```json
{
  "ok": true,
  "predictions": [
    {
      "meeting_id": "123",
      "timestamp": 1699999999999,
      "bbox": {"x":0,"y":0,"w":0,"h":0},
      "emotion": "happy",
      "confidence": 0.87,
      "frame_id": 20
    }
  ]
}
```

#### 2. GET `/api/emotion-analytics/emotion/:meetingId` 
Get emotion history for a meeting

**Response:**
```json
{
  "ok": true,
  "emotions": [
    {
      "meeting_id": "123",
      "timestamp": 1699999999999,
      "emotion": "happy",
      "confidence": 0.87,
      "frame_id": 20
    }
  ]
}
```

### Socket.io Events

**Client emits:**
```javascript
// Join a meeting room for emotion events
socket.emit("join", meetingId)
```

**Server emits:**
```javascript
// Real-time emotion detection event
socket.on("emotion_event", (data) => {
  console.log(data);
  // {
  //   meeting_id: "123",
  //   timestamp: 1699999999999,
  //   bbox: {x:0, y:0, w:0, h:0}, 
  //   emotion: "happy",
  //   confidence: 0.87,
  //   frame_id: 20
  // }
});
```

## Troubleshooting

1. **Webcam access issues**: Make sure your browser has permission to access the webcam
2. **CORS errors**: Check that CORS is properly configured in the server
3. **Rate limiting**: Adjust `SAMPLE_EVERY_N_FRAMES` if too many requests are being sent
4. **Roboflow API errors**: Verify your API key and inference URL are correct
