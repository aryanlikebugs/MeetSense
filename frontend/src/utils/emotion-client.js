import { io } from "socket.io-client";

class EmotionClient {
  constructor(options = {}) {
    this.options = {
      serverUrl: options.serverUrl || window.location.origin,
      onEmotionEvent: options.onEmotionEvent || (() => {}),
      onConnect: options.onConnect || (() => {}),
      onDisconnect: options.onDisconnect || (() => {})
    };
    
    this.socket = io(this.options.serverUrl);
    this.setupListeners();
  }
  
  setupListeners() {
    this.socket.on('connect', () => {
      console.log('Connected to socket server');
      this.options.onConnect();
    });
    
    this.socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
      this.options.onDisconnect();
    });
    
    this.socket.on('emotion_event', (data) => {
      this.options.onEmotionEvent(data);
    });
  }
  
  joinMeeting(meetingId) {
    if (!meetingId) {
      console.warn('Cannot join meeting: Meeting ID is missing');
      return false;
    }
    
    this.socket.emit('join', meetingId);
    console.log(`Joined meeting room: ${meetingId}`);
    return true;
  }
  
  leaveMeeting(meetingId) {
    if (!meetingId) return;
    
    this.socket.emit('leave', meetingId);
    console.log(`Left meeting room: ${meetingId}`);
  }
  
  async getEmotionHistory(meetingId) {
    try {
      // Log the request URL for debugging
      const url = `/api/emotion-analytics/emotion/${meetingId}`;
      console.log('Fetching emotion history from:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error(`API error: ${response.status} ${response.statusText}`);
        return [];
      }
      
      // First get as text to handle potential non-JSON responses
      const text = await response.text();
      
      try {
        const data = JSON.parse(text);
        return data.emotions || [];
      } catch (parseError) {
        // Log what we received instead of JSON
        console.error('Expected JSON but received:', text.slice(0, 200) + '...');
        console.error('JSON parse error:', parseError);
        return [];
      }
    } catch (error) {
      console.error('Failed to fetch emotion history:', error);
      return [];
    }
  }
}

export default EmotionClient;
