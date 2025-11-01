import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, Users, Smile, Frown, Meh } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import AnalyticsCard from '../components/AnalyticsCard';
import Loader from '../components/Loader';
import { useAnalytics } from '../hooks/useAnalytics';
import { formatDuration } from '../utils/formatDate';
import { EXPRESSIONS } from '../utils/constants';

const Analytics = () => {
  const [searchParams] = useSearchParams();
  const meetingId = searchParams.get('meetingId') || '1';
  const { analytics, loading } = useAnalytics(meetingId);

  if (loading) {
    return (
      <DashboardLayout>
        <Loader size="lg" />
      </DashboardLayout>
    );
  }

  if (!analytics) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">No analytics data available</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Meeting Analytics</h1>
          <p className="text-gray-600">Detailed insights and engagement metrics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <AnalyticsCard
            title="Duration"
            value={formatDuration(analytics.duration)}
            icon={Clock}
            color="primary"
          />
          <AnalyticsCard
            title="Participants"
            value={analytics.participants.length}
            icon={Users}
            color="secondary"
          />
          <AnalyticsCard
            title="Engagement"
            value={`${analytics.overallEngagement}%`}
            icon={TrendingUp}
            color="success"
          />
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Expression Timeline</h2>
          <div className="space-y-4">
            {analytics.expressionTimeline.map((point, index) => (
              <div key={index} className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-600 w-16">
                  {point.timestamp}
                </span>
                <div className="flex-1 bg-gray-100 rounded-full h-8 flex overflow-hidden">
                  {EXPRESSIONS.map((expr) => {
                    const count = point[expr.label.toLowerCase()] || 0;
                    const total = Object.values(point).reduce((sum, val) =>
                      typeof val === 'number' ? sum + val : sum, 0
                    );
                    const percentage = total > 0 ? (count / total) * 100 : 0;

                    return percentage > 0 ? (
                      <div
                        key={expr.label}
                        className="flex items-center justify-center text-xs font-medium text-white"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: expr.color,
                        }}
                        title={`${expr.label}: ${count}`}
                      >
                        {count > 0 && expr.emoji}
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Participant Details</h2>
          <div className="space-y-4">
            {analytics.participants.map((participant) => (
              <div
                key={participant.id}
                className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900">{participant.name}</h3>
                    <p className="text-sm text-gray-600">
                      Active: {formatDuration(participant.activeTime)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Engagement Score</p>
                    <p className="text-2xl font-bold text-primary-600">
                      {participant.engagementScore}%
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries(participant.expressions).map(([type, percentage]) => {
                    const expr = EXPRESSIONS.find(
                      (e) => e.label.toLowerCase() === type.toLowerCase()
                    );
                    return (
                      <div
                        key={type}
                        className="bg-gray-50 rounded-lg p-3 text-center"
                      >
                        <span className="text-2xl mb-1 block">{expr?.emoji}</span>
                        <p className="text-xs text-gray-600 mb-1">{expr?.label}</p>
                        <p className="text-sm font-bold" style={{ color: expr?.color }}>
                          {percentage}%
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Analytics;
