import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import MeetingLayout from '../layouts/MeetingLayout';
import ParticipantCard from '../components/ParticipantCard';
import ChatBox from '../components/ChatBox';
import TranscriptPanel from '../components/TranscriptPanel';
import ControlBar from '../components/ControlBar';
import Button from '../components/Button';
import { useMeeting } from '../hooks/useMeeting';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import EmotionDetection from '../components/EmotionDetection';

const MeetingRoom = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeMeeting, participants, expressions, reactions, localStream, isMuted, isVideoOff, joinMeeting, leaveMeeting } = useMeeting();
  const { showInfo, showError } = useNotifications();
  const [joined, setJoined] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [joinError, setJoinError] = useState(null);

  useEffect(() => {
    if (user && meetingId && !joined) {
      joinMeeting(meetingId).then((result) => {
        if (result && (result._id || result.id)) {
          setJoined(true);
          setJoinError(null);
          showInfo(`Joined meeting: ${meetingId}`);
        } else {
          setJoinError('Failed to join meeting');
          showError('Failed to join meeting');
        }
      }).catch(err => {
        console.error('Failed to join meeting', err);
        setJoinError('Failed to join meeting');
        showError('Failed to join meeting');
      });
    }

    return () => {
      if (joined && activeMeeting?._id) {
        leaveMeeting();
      }
    };
  }, [meetingId, user, joined]);

  const handleLeaveMeeting = async () => {
    await leaveMeeting();
    navigate('/dashboard');
  };

  const isHost = activeMeeting && String(activeMeeting.host?._id || activeMeeting.host) === String(user?._id);

  // Show error state if join failed
  if (joinError) {
    return (
      <MeetingLayout>
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Failed to Join Meeting</h2>
            <p className="text-gray-600 mb-6">{joinError}</p>
            <Button onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </MeetingLayout>
    );
  }

  // Show loading state if not joined yet
  if (!joined || !activeMeeting) {
    return (
      <MeetingLayout>
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-400">Joining meeting...</p>
          </div>
        </div>
      </MeetingLayout>
    );
  }

  return (
    <MeetingLayout>
      <div className="min-h-screen p-6 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-1">{activeMeeting?.topic || 'Meeting Room'}</h1>
            <p className="text-gray-400">Meeting ID: {meetingId}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <EmotionDetection />
            <AnimatePresence>
              {user && (
                <ParticipantCard
                  key="current-user"
                  participant={{
                    id: user._id || user.id,
                    name: `${user.name} (You)${isHost ? ' - Host' : ''}`,
                    avatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`,
                    isMuted: isMuted,
                    isVideoOff: isVideoOff,
                    isHost,
                  }}
                  expression={expressions[user._id || user.id]}
                  stream={localStream}
                  reaction={reactions[user._id || user.id]}
                />
              )}

              {participants.filter(p => String(p.userId?._id || p.userId || p._id) !== String(user?._id)).map((participant) => (
                <ParticipantCard
                  key={participant.userId?._id || participant.userId || participant._id}
                  participant={{
                    id: participant.userId?._id || participant.userId || participant._id,
                    name: participant.userId?.name || participant.name || 'Participant',
                    avatar: participant.userId?.avatar || participant.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${participant.userId?.name || participant.name}`,
                    isMuted: false,
                    isVideoOff: false,
                  }}
                  expression={expressions[participant.userId?._id || participant.userId || participant._id]}
                  reaction={reactions[participant.userId?._id || participant.userId || participant._id]}
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

      <AnimatePresence>
        {transcriptOpen && (
          <motion.div
            initial={{ x: -400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -400, opacity: 0 }}
            className="fixed left-0 top-0 bottom-0 w-96 bg-gray-900 shadow-2xl z-40 flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gradient-to-r from-blue-600 to-purple-600">
              <h3 className="text-lg font-bold text-white">Live Transcript</h3>
              <button
                onClick={() => setTranscriptOpen(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={20} className="text-white" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <TranscriptPanel />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ChatBox isOpen={chatOpen} onClose={() => setChatOpen(false)} />
      <ControlBar 
        onChatToggle={() => setChatOpen(prev => !prev)} 
        onTranscriptToggle={() => setTranscriptOpen(prev => !prev)}
        isHost={isHost} 
        onLeaveMeeting={handleLeaveMeeting} 
      />
    </MeetingLayout>
  );
};

export default MeetingRoom;
