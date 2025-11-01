import { motion } from 'framer-motion';
import { Mic, MicOff, Video, VideoOff, MonitorUp, MessageSquare, PhoneOff, Circle } from 'lucide-react';
import { useMeeting } from '../hooks/useMeeting';

const ControlBar = ({ onChatToggle, isRecording = false }) => {
  const {
    isMuted,
    isVideoOff,
    isScreenSharing,
    toggleMute,
    toggleVideo,
    toggleScreenShare,
    leaveMeeting,
  } = useMeeting();

  const controls = [
    {
      icon: isMuted ? MicOff : Mic,
      label: isMuted ? 'Unmute' : 'Mute',
      onClick: toggleMute,
      active: !isMuted,
      bgColor: isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600',
    },
    {
      icon: isVideoOff ? VideoOff : Video,
      label: isVideoOff ? 'Turn On Video' : 'Turn Off Video',
      onClick: toggleVideo,
      active: !isVideoOff,
      bgColor: isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600',
    },
    {
      icon: MonitorUp,
      label: isScreenSharing ? 'Stop Sharing' : 'Share Screen',
      onClick: toggleScreenShare,
      active: isScreenSharing,
      bgColor: isScreenSharing ? 'bg-primary-500 hover:bg-primary-600' : 'bg-gray-700 hover:bg-gray-600',
    },
    {
      icon: MessageSquare,
      label: 'Chat',
      onClick: onChatToggle,
      bgColor: 'bg-gray-700 hover:bg-gray-600',
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

          <div className="flex items-center gap-3">
            {controls.map((control) => (
              <motion.button
                key={control.label}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={control.onClick}
                className={`p-4 rounded-xl text-white transition-colors ${control.bgColor}`}
                title={control.label}
              >
                <control.icon size={24} />
              </motion.button>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={leaveMeeting}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl flex items-center gap-2 transition-colors"
          >
            <PhoneOff size={20} />
            <span className="font-medium">Leave Meeting</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default ControlBar;
