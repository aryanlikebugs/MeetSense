import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMeeting } from '../hooks/useMeeting';
import EmotionCapture from '../utils/emotion-capture';
import EmotionClient from '../utils/emotion-client';
import EmotionTimeline from './EmotionTimeline';

/**
 * EmotionDetection component integrates with the video feed
 * to capture frames and analyze emotions
 */
const EmotionDetection = () => {
  const { id: meetingId } = useParams();
  const navigate = useNavigate();
  const { localStream, isVideoOff, activeMeeting } = useMeeting();
  
  const [isCapturing, setIsCapturing] = useState(false);
  const [latestPrediction, setLatestPrediction] = useState(null);
  const videoRef = useRef(null);
  const captureRef = useRef(null);
  const clientRef = useRef(null);

  // Initialize emotion client
  useEffect(() => {
    if (!meetingId) return;
    
    // Create emotion client for real-time updates
    clientRef.current = new EmotionClient({
      onEmotionEvent: (event) => {
        setLatestPrediction(event);
      }
    });
    
    // Join the emotion room
    clientRef.current.joinMeeting(meetingId);
    
    return () => {
      if (clientRef.current) {
        clientRef.current.leaveMeeting(meetingId);
      }
    };
  }, [meetingId]);

  // Set up video stream
  useEffect(() => {
    if (videoRef.current && localStream && !isVideoOff) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream, isVideoOff]);

  // Initialize emotion capture
  useEffect(() => {
    if (!videoRef.current || !meetingId) return;
    
    const initCapture = async () => {
      captureRef.current = new EmotionCapture({
        apiEndpoint: '/api/detect/frame',
        everyNFrames: 30, // Capture every ~1 second at 30fps
        meetingId: meetingId,
        videoElement: videoRef.current,
        onCaptureStart: () => console.log('Emotion capture started'),
        onCapture: (result) => {
          if (result?.predictions?.[0]) {
            setLatestPrediction(result.predictions[0]);
          }
        },
        onError: (err) => console.error('Emotion capture error:', err)
      });
      
      await captureRef.current.initialize();
      
      if (isCapturing) {
        captureRef.current.start();
      }
    };
    
    initCapture();
    
    return () => {
      if (captureRef.current) {
        captureRef.current.stop();
      }
    };
  }, [meetingId, videoRef.current]);
  
  // Handle capture toggle
  const handleCaptureToggle = () => {
    setIsCapturing(prev => {
      const newState = !prev;
      
      if (newState && captureRef.current) {
        captureRef.current.start();
      } else if (captureRef.current) {
        captureRef.current.stop();
      }
      
      return newState;
    });
  };
  
  // Get the actual meeting ID from either URL params or active meeting
  const actualMeetingId = meetingId || activeMeeting?._id;

  return (
    <div className="mt-4">
      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="p-4">
          <h3 className="text-xl font-bold text-white mb-4">
            Emotion Analysis
          </h3>
          
          {!actualMeetingId && (
            <div className="bg-red-900 text-white p-3 mb-4 rounded">
              <p>Meeting ID is required for emotion analysis.</p>
            </div>
          )}
          
          {/* Hidden video element for frame capture */}
          <video 
            ref={videoRef} 
            width="320"
            height="240"
            autoPlay 
            muted
            style={{ display: 'none' }}
          />
          
          <div className="flex items-center mb-4">
            <label className="inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={isCapturing}
                onChange={handleCaptureToggle}
                disabled={!localStream || isVideoOff}
              />
              <div className="relative w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              <span className="ms-3 text-sm font-medium text-gray-300">Enable Emotion Detection</span>
            </label>
          </div>
          
          {(!localStream || isVideoOff) && (
            <p className="text-gray-400 text-sm mb-4">
              Turn on your camera to enable emotion detection
            </p>
          )}
          
          {latestPrediction && (
            <div className="bg-gray-700 rounded-md p-4 mb-4">
              <p className="text-white font-medium">
                Latest detected emotion: {latestPrediction.emotion}
              </p>
              <p className="text-gray-300 text-sm">
                Confidence: {Math.round(latestPrediction.confidence * 100)}%
              </p>
              <p className="text-gray-300 text-sm">
                Detected at: {new Date(latestPrediction.timestamp).toLocaleTimeString()}
              </p>
            </div>
          )}
          
          {/* Emotion Timeline - Only render if we have a meeting ID */}
          {actualMeetingId && <EmotionTimeline meetingId={actualMeetingId} />}
        </div>
      </div>
    </div>
  );
};

export default EmotionDetection;
