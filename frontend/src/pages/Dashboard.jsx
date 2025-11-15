import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, LogIn, Video, Clock, Users, TrendingUp, Sparkles } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import Button from '../components/Button';
import MeetingTile from '../components/MeetingTile';
import AnalyticsCard from '../components/AnalyticsCard';
import { meetingService } from '../services/meetingService';
import { analyticsService } from '../services/analyticsService';
import { useAuth } from '../hooks/useAuth';
import { formatDuration } from '../utils/formatDate';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recentMeetings, setRecentMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [engagementRate, setEngagementRate] = useState('-');
  const totalMeetings = recentMeetings.length;
  const totalParticipants = recentMeetings.reduce((acc, m) => acc + (m.participantCount || 0), 0);
  const avgDurationSeconds = recentMeetings.length
    ? Math.round(
        recentMeetings.reduce((acc, m) => acc + (m.duration || 0), 0) / recentMeetings.length / 1000,
      )
    : 0;
  const avgDuration = avgDurationSeconds > 0 ? formatDuration(avgDurationSeconds) : '0m';

  const highlightStats = [
    { label: 'Meetings', value: totalMeetings },
    { label: 'Participants', value: totalParticipants },
    { label: 'Avg Duration', value: avgDuration },
  ];

  useEffect(() => {
    if (user?._id || user?.id) {
      meetingService.getUserMeetings(user._id || user.id)
        .then(meetings => {
          const mappedMeetings = meetings.map(m => ({
            id: m._id || m.id,
            title: m.topic,
            createdAt: m.createdAt,
            duration: m.endedAt && m.createdAt ? new Date(m.endedAt) - new Date(m.createdAt) : 0,
            participantCount: m.participants?.length || 0,
            engagementScore: 75, // placeholder
          }));

          setRecentMeetings(mappedMeetings);

          // Use the most recent meeting to compute engagement rate from real emotion analytics
          if (mappedMeetings.length) {
            const latestMeetingId = mappedMeetings[0].id;
            analyticsService.getMeetingAnalytics(latestMeetingId)
              .then(analytics => {
                if (analytics && typeof analytics.overallEngagement === 'number') {
                  setEngagementRate(`${analytics.overallEngagement}%`);
                } else {
                  setEngagementRate('-');
                }
              })
              .catch(err => {
                console.error('Failed to load engagement analytics', err);
                setEngagementRate('-');
              });
          } else {
            setEngagementRate('-');
          }
        })
        .catch(err => console.error('Failed to load meetings', err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-900/40 shadow-2xl p-6 md:p-8 mb-10">
          <div className="absolute inset-0 opacity-60">
            <div className="absolute -top-16 -right-10 h-48 w-48 bg-purple-500/30 blur-[120px]" />
            <div className="absolute -bottom-10 -left-6 h-40 w-40 bg-sky-500/30 blur-[100px]" />
          </div>

          <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/10 border border-white/20 text-xs uppercase tracking-[0.3em] text-slate-100">
                <Sparkles size={14} /> Intelligence Hub
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-white mt-4 mb-2">
                Dashboard
              </h1>
              <p className="text-slate-300 max-w-xl">
                Manage your meetings, monitor performance, and get a quick glance at engagement stats all in one place.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button className="flex-1 sm:flex-none" size="lg" onClick={() => navigate('/create-meeting')}>
                <Plus size={20} />
                New Meeting
              </Button>
              <Button
                variant="secondary"
                className="flex-1 sm:flex-none bg-white/10 text-white border-white/30 hover:bg-white/20"
                size="lg"
                onClick={() => navigate('/join-meeting')}
              >
                <LogIn size={20} />
                Join Meeting
              </Button>
            </div>
          </div>

          <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
            {highlightStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/10 bg-white/5/60 backdrop-blur px-4 py-3 flex flex-col"
              >
                <span className="text-xs uppercase tracking-wider text-slate-300">{stat.label}</span>
                <span className="text-lg font-semibold text-white">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <AnalyticsCard
            title="Total Meetings"
            value={totalMeetings}
            icon={Video}
            color="primary"
          />
          <AnalyticsCard
            title="Avg Duration"
            value={avgDuration}
            icon={Clock}
            color="secondary"
          />
          <AnalyticsCard
            title="Total Participants"
            value={totalParticipants}
            icon={Users}
            color="success"
          />
          <AnalyticsCard
            title="Engagement Rate"
            value={engagementRate}
            icon={TrendingUp}
            color="warning"
          />
        </div>

        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Recent Meetings</h2>
            <Button
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
              onClick={() => navigate('/analytics')}
            >
              View All
            </Button>
          </div>

          {recentMeetings.length === 0 ? (
            <motion.div
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur p-12 text-center shadow-xl"
            >
              <Video size={64} className="mx-auto mb-4 text-slate-500" />
              <h3 className="text-xl font-bold text-white mb-2">No meetings yet</h3>
              <p className="text-slate-300 mb-6">Start your first meeting to see it here</p>
              <Button onClick={() => navigate('/create-meeting')}>
                <Plus size={20} />
                Start New Meeting
              </Button>
            </motion.div>
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
