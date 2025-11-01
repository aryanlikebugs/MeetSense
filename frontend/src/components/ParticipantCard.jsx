import { motion } from 'framer-motion';
import { Mic, MicOff, Video, VideoOff } from 'lucide-react';
import ExpressionOverlay from './ExpressionOverlay';

const ParticipantCard = ({ participant, expression }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative bg-gray-900 rounded-2xl overflow-hidden aspect-video group"
    >
      {participant.isVideoOff ? (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-500 to-secondary-500">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-3xl font-bold text-white">
                {participant.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <p className="text-white font-medium">{participant.name}</p>
          </div>
        </div>
      ) : (
        <>
          <img
            src={participant.avatar}
            alt={participant.name}
            className="w-full h-full object-cover"
          />
          {expression && <ExpressionOverlay expression={expression} />}
        </>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center justify-between">
          <span className="text-white font-medium text-sm">{participant.name}</span>
          <div className="flex items-center gap-2">
            {participant.isMuted ? (
              <div className="p-1.5 bg-red-500 rounded-full">
                <MicOff size={14} className="text-white" />
              </div>
            ) : (
              <div className="p-1.5 bg-green-500 rounded-full">
                <Mic size={14} className="text-white" />
              </div>
            )}
            {participant.isVideoOff && (
              <div className="p-1.5 bg-red-500 rounded-full">
                <VideoOff size={14} className="text-white" />
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ParticipantCard;
