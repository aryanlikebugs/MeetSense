import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, LogIn, Video, Clock, Users, TrendingUp } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import Button from '../components/Button';
import MeetingTile from '../components/MeetingTile';
import AnalyticsCard from '../components/AnalyticsCard';
import { MOCK_ANALYTICS } from '../utils/constants';
import { meetingService } from '../services/meetingService';
import { useAuth } from '../hooks/useAuth';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recentMeetings, setRecentMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?._id || user?.id) {
      meetingService.getUserMeetings(user._id || user.id)
        .then(meetings => {
          setRecentMeetings(meetings.map(m => ({
            id: m._id || m.id,
            title: m.topic,
            createdAt: m.createdAt,
            duration: m.endedAt && m.createdAt ? new Date(m.endedAt) - new Date(m.createdAt) : 0,
            participantCount: m.participants?.length || 0,
            engagementScore: 75, // placeholder
          })));
        })
        .catch(err => console.error('Failed to load meetings', err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Manage your meetings and view analytics</p>
          </div>

          <div className="flex gap-3">
            <Button onClick={() => navigate('/create-meeting')}>
              <Plus size={20} />
              New Meeting
            </Button>
            <Button variant="secondary" onClick={() => navigate('/join-meeting')}>
              <LogIn size={20} />
              Join Meeting
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <AnalyticsCard
            title="Total Meetings"
            value={MOCK_ANALYTICS.totalMeetings}
            icon={Video}
            color="primary"
          />
          <AnalyticsCard
            title="Avg Duration"
            value={MOCK_ANALYTICS.avgDuration}
            icon={Clock}
            color="secondary"
          />
          <AnalyticsCard
            title="Total Participants"
            value={MOCK_ANALYTICS.totalParticipants}
            icon={Users}
            color="success"
          />
          <AnalyticsCard
            title="Engagement Rate"
            value={MOCK_ANALYTICS.engagementRate}
            icon={TrendingUp}
            color="warning"
          />
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Meetings</h2>
            <Button
              variant="ghost"
              onClick={() => navigate('/analytics')}
            >
              View All
            </Button>
          </div>

          {recentMeetings.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <Video size={64} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No meetings yet</h3>
              <p className="text-gray-600 mb-6">Start your first meeting to see it here</p>
              <Button onClick={() => navigate('/create-meeting')}>
                <Plus size={20} />
                Start New Meeting
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentMeetings.map((meeting) => (
                <MeetingTile
                  key={meeting.id}
                  meeting={meeting}
                  onClick={() => navigate(`/analytics?meetingId=${meeting.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Dashboard;
