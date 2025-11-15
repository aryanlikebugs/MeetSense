import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Video, VideoOff, MonitorUp, MessageSquare, PhoneOff, Circle, Smile, FileText } from 'lucide-react';
import { useMeeting } from '../hooks/useMeeting';
import { useSocket } from '../context/SocketContext';
import { meetingService } from '../services/meetingService';

const REACTIONS = ['👍', '👎', '❤️', '😂', '🎉', '🔥', '👏', '🙌'];

const ControlBar = ({ onChatToggle, onTranscriptToggle, isRecording = false, isHost = false, onLeaveMeeting }) => {
  const {
    isMuted,
    isVideoOff,
    isScreenSharing,
    toggleMute,
    toggleVideo,
    toggleScreenShare,
    sendReaction,
    activeMeeting,
    chatMessages,
  } = useMeeting();
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [chatBadge, setChatBadge] = useState(0);
  const { socket } = useSocket() || {};

  useEffect(() => {
    setChatBadge(chatMessages?.length || 0);
  }, [chatMessages]);

  const handleEndMeeting = async (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!activeMeeting?._id || !socket) return;
    socket.emit('host-end-meeting', { meetingId: activeMeeting._id });
    await meetingService.endMeeting?.(activeMeeting._id).catch(() => {});
    meetingService.generateNotes?.(activeMeeting._id)
      .then(() => console.log('AI notes generated'))
      .catch((err) => console.error('AI notes generation failed', err));
    setShowEndConfirm(false);
    if (onLeaveMeeting) {
      onLeaveMeeting();
    }
  };

  const handleHostLeaveOnly = async (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    // Host leaves without ending for others
    if (activeMeeting?._id && socket) {
      socket.emit('leave-meeting', { meetingId: activeMeeting._id });
    }
    setShowEndConfirm(false);
    if (onLeaveMeeting) {
      onLeaveMeeting();
    }
  };

  const handleLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onLeaveMeeting) {
      onLeaveMeeting();
    }
  };

  const controls = [
    {
      icon: isMuted ? MicOff : Mic,
      label: isMuted ? 'Unmute' : 'Mute',
      onClick: toggleMute,
      active: !isMuted,
      bgColor: isMuted 
        ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/50' 
        : 'bg-gray-700 hover:bg-gray-600 shadow-lg',
      badge: null,
    },
    {
      icon: isVideoOff ? VideoOff : Video,
      label: isVideoOff ? 'Turn On Video' : 'Turn Off Video',
      onClick: toggleVideo,
      active: !isVideoOff,
      bgColor: isVideoOff 
        ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/50' 
        : 'bg-gray-700 hover:bg-gray-600 shadow-lg',
      badge: null,
    },
    {
      icon: MonitorUp,
      label: isScreenSharing ? 'Stop Sharing' : 'Share Screen',
      onClick: toggleScreenShare,
      active: isScreenSharing,
      bgColor: isScreenSharing 
        ? 'bg-primary-500 hover:bg-primary-600 shadow-lg shadow-primary-500/50' 
        : 'bg-gray-700 hover:bg-gray-600 shadow-lg',
      badge: null,
    },
    {
      icon: MessageSquare,
      label: 'Chat',
      onClick: onChatToggle,
      bgColor: 'bg-gray-700 hover:bg-gray-600 shadow-lg',
      badge: chatBadge > 0 ? chatBadge : null,
    },
    {
      icon: FileText,
      label: 'Transcript',
      onClick: onTranscriptToggle,
      bgColor: 'bg-gray-700 hover:bg-gray-600 shadow-lg',
      badge: null,
    },
    {
      icon: Smile,
      label: 'Reactions',
      onClick: () => setShowReactions(!showReactions),
      active: showReactions,
      bgColor: showReactions 
        ? 'bg-yellow-500 hover:bg-yellow-600 shadow-lg shadow-yellow-500/50' 
        : 'bg-gray-700 hover:bg-gray-600 shadow-lg',
      badge: null,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-30">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isRecording && (
              <div className="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-xl">
                <Circle size={12} className="text-red-600 fill-current animate-pulse" />
                <span className="text-sm font-medium text-red-600">Recording</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 relative">
            {controls.map((control) => (
              <div key={control.label} className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={control.onClick}
                  className={`relative p-4 rounded-xl text-white transition-all duration-200 ${control.bgColor} ${
                    control.active ? 'ring-2 ring-white/30' : ''
                  }`}
                  title={control.label}
                >
                  <control.icon size={24} />
                  {control.badge && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {control.badge}
                    </span>
                  )}
                </motion.button>
              </div>
            ))}
            
            <AnimatePresence>
              {showReactions && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.8 }}
                  className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl shadow-2xl p-3 border border-gray-200"
                >
                  <div className="flex gap-2">
                    {REACTIONS.map((emoji) => (
                      <motion.button
                        key={emoji}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          sendReaction(emoji);
                          setShowReactions(false);
                        }}
                        className="text-3xl p-2 hover:bg-gray-100 rounded-xl transition-colors"
                        title={`React with ${emoji}`}
                      >
                        {emoji}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {isHost ? (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowEndConfirm(true);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                style={{ pointerEvents: 'auto' }}
              >
                <PhoneOff size={20} />
                <span className="font-medium">End Meeting</span>
              </motion.button>
              {showEndConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white rounded-2xl p-6 max-w-md"
                  >
                    <h3 className="text-xl font-bold mb-2">End meeting</h3>
                    <p className="text-gray-600 mb-4">Choose whether to end for all or leave only for you.</p>
                    <div className="flex gap-3">
                      <div className="flex flex-col gap-2 w-full">
                        <button
                          onClick={handleEndMeeting}
                          onMouseDown={(e) => e.stopPropagation()}
                          className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl cursor-pointer"
                          style={{ pointerEvents: 'auto' }}
                        >
                          End for All
                        </button>
                        <button
                          onClick={handleHostLeaveOnly}
                          onMouseDown={(e) => e.stopPropagation()}
                          className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-xl cursor-pointer"
                          style={{ pointerEvents: 'auto' }}
                        >
                          Leave Only Host
                        </button>
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowEndConfirm(false);
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-xl cursor-pointer"
                        style={{ pointerEvents: 'auto' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLeave}
              onMouseDown={(e) => e.stopPropagation()}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
              style={{ pointerEvents: 'auto' }}
            >
              <PhoneOff size={20} />
              <span className="font-medium">Leave Meeting</span>
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ControlBar;
