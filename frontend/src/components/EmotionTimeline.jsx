import React, { useState, useEffect } from 'react';
import EmotionClient from '../utils/emotion-client';

const EmotionTimeline = ({ meetingId, serverUrl }) => {
  const [emotions, setEmotions] = useState([]);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!meetingId) {
      setError('Meeting ID is required');
      setLoading(false);
      return;
    }

    // Initialize client
    const emotionClient = new EmotionClient({
      serverUrl,
      onEmotionEvent: (event) => {
        setEmotions(prev => [event, ...prev.slice(0, 499)]);
      },
      onConnect: () => console.log('Socket connected'),
      onDisconnect: () => console.log('Socket disconnected')
    });
    
    setClient(emotionClient);
    
    // Load history
    const loadHistory = async () => {
      try {
        setLoading(true);
        const history = await emotionClient.getEmotionHistory(meetingId);
        setEmotions(history);
        setLoading(false);
      } catch (err) {
        setError('Failed to load emotion history');
        setLoading(false);
      }
    };
    
    loadHistory();
    
    // Join meeting room
    const joined = emotionClient.joinMeeting(meetingId);
    if (!joined) {
      setError('Failed to join meeting room');
    }
    
    // Cleanup
    return () => {
      emotionClient.leaveMeeting(meetingId);
    };
  }, [meetingId, serverUrl]);
  
  const getEmotionColor = (emotion) => {
    switch(emotion) {
      case 'happy':
        return '#4CAF50';
      case 'neutral':
        return '#9E9E9E';
      case 'sad':
        return '#2196F3';
      case 'angry':
        return '#F44336';
      case 'surprised':
        return '#FF9800';
      default:
        return '#9C27B0';
    }
  };

  if (loading) return <div>Loading emotion data...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div className="mt-4 bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white">Emotion Timeline</h3>
      </div>
      <div className="p-4">
        <div className="emotion-stats flex flex-wrap gap-2 mb-4">
          {calculateEmotionStats(emotions).map(stat => (
            <span
              key={stat.emotion}
              className="inline-block rounded-full px-3 py-1 text-sm font-medium text-white"
              style={{ backgroundColor: getEmotionColor(stat.emotion) }}
            >
              {stat.emotion}: {stat.count} ({stat.percent}%)
            </span>
          ))}
        </div>
        <div className="emotion-events" style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {emotions.map((event, index) => (
            <div 
              key={`${event.meeting_id}-${event.timestamp}-${index}`} 
              className="emotion-event"
              style={{
                display: 'flex',
                alignItems: 'center',
                borderBottom: '1px solid #eee',
                padding: '8px 0'
              }}
            >
              <div 
                className="emotion-marker"
                style={{
                  backgroundColor: getEmotionColor(event.emotion),
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  marginRight: '8px'
                }}
              >
                {event.emotion}
              </div>
              <div className="emotion-time">
                {new Date(event.timestamp).toLocaleTimeString()}
              </div>
              <div className="emotion-confidence" style={{ marginLeft: 'auto' }}>
                {Math.round(event.confidence * 100)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper to calculate emotion statistics
function calculateEmotionStats(emotions) {
  const counts = emotions.reduce((acc, event) => {
    acc[event.emotion] = (acc[event.emotion] || 0) + 1;
    return acc;
  }, {});
  
  const total = emotions.length;
  
  return Object.entries(counts).map(([emotion, count]) => ({
    emotion,
    count,
    percent: total ? Math.round((count / total) * 100) : 0
  })).sort((a, b) => b.count - a.count);
}

export default EmotionTimeline;
