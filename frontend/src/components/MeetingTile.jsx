import { motion } from 'framer-motion';
import { Calendar, Clock, Users, TrendingUp } from 'lucide-react';
import { formatDateTime, formatDuration } from '../utils/formatDate';

const MeetingTile = ({ meeting, onClick }) => {
  const durationSeconds = Math.max(0, Math.round((meeting.duration || 0) / 1000));

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer border border-gray-100 overflow-hidden"
      onClick={onClick}
    >
      <div className="h-2 bg-gradient-primary"></div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-3">{meeting.title}</h3>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar size={16} />
            <span className="text-sm">{formatDateTime(meeting.createdAt)}</span>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <Clock size={16} />
            <span className="text-sm">{formatDuration(durationSeconds)}</span>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <Users size={16} />
            <span className="text-sm">{meeting.participantCount || 0} participants</span>
          </div>
        </div>

        {meeting.engagementScore !== undefined && (
          <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
            <TrendingUp size={16} className="text-primary-600" />
            <span className="text-sm font-medium text-gray-700">
              Engagement: <span className="text-primary-600">{meeting.engagementScore}%</span>
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MeetingTile;
