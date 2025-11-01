import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import MeetingLayout from '../layouts/MeetingLayout';
import ParticipantCard from '../components/ParticipantCard';
import { useMeeting } from '../hooks/useMeeting';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';

const MeetingRoom = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { participants, expressions, joinMeeting, leaveMeeting } = useMeeting();
  const { showInfo } = useNotifications();
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    if (user && !joined) {
      joinMeeting(meetingId, user.name);
      setJoined(true);
      showInfo(`Joined meeting: ${meetingId}`);

      const mockParticipants = [
        { id: '1', name: 'Alice Johnson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice', isMuted: false, isVideoOff: false },
        { id: '2', name: 'Bob Smith', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob', isMuted: true, isVideoOff: false },
        { id: '3', name: 'Charlie Brown', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie', isMuted: false, isVideoOff: true },
      ];

      mockParticipants.forEach((p) => joinMeeting(meetingId, p.name));
    }

    return () => {
      if (joined) {
        leaveMeeting();
      }
    };
  }, [meetingId, user, joined]);

  const handleLeaveMeeting = () => {
    leaveMeeting();
    navigate('/dashboard');
  };

  useEffect(() => {
    const originalLeaveMeeting = leaveMeeting;
    window.addEventListener('beforeunload', originalLeaveMeeting);
    return () => {
      window.removeEventListener('beforeunload', originalLeaveMeeting);
    };
  }, []);

  return (
    <MeetingLayout>
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-1">Meeting Room</h1>
            <p className="text-gray-400">Meeting ID: {meetingId}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence>
              {user && (
                <ParticipantCard
                  key="current-user"
                  participant={{
                    id: 'current-user',
                    name: `${user.name} (You)`,
                    avatar: user.avatar,
                    isMuted: false,
                    isVideoOff: false,
                  }}
                  expression={expressions['current-user']}
                />
              )}

              {participants.map((participant) => (
                <ParticipantCard
                  key={participant.id}
                  participant={participant}
                  expression={expressions[participant.id]}
                />
              ))}
            </AnimatePresence>
          </div>

          {participants.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center mt-12"
            >
              <p className="text-gray-400 text-lg">Waiting for others to join...</p>
            </motion.div>
          )}
        </div>
      </div>
    </MeetingLayout>
  );
};

export default MeetingRoom;
