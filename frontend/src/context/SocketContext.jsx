import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createSocket, joinMeetingSocket } from '../utils/socketClient';
import { useAuth } from '../hooks/useAuth';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [socket, setSocket] = useState(null);
  const meetingRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }
    const s = createSocket();
    setSocket(s);
    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, [isAuthenticated]);

  const connectToMeeting = (meetingId) => {
    if (socket && meetingId && user) {
      meetingRef.current = meetingId;
      joinMeetingSocket(socket, meetingId, user);
    }
  };

  const value = useMemo(() => ({ socket, connectToMeeting }), [socket]);

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
};
