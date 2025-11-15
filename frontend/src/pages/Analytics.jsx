import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, Users, Activity } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import AnalyticsCard from '../components/AnalyticsCard';
import Loader from '../components/Loader';
import { useAnalytics } from '../hooks/useAnalytics';
import { aiNotesService } from '../services/aiNotesService';
import { formatDuration } from '../utils/formatDate';
import { EXPRESSIONS } from '../utils/constants';

const Analytics = () => {
  const [searchParams] = useSearchParams();
  const meetingId = searchParams.get('meetingId') || '1';
  const { analytics, loading } = useAnalytics(meetingId);
  const [summary, setSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState('');
  const [showSummaryCard, setShowSummaryCard] = useState(false);
  const [noteReport, setNoteReport] = useState(null);

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

  const {
    duration = 0,
    participants = [],
    overallEngagement = 0,
    expressionTimeline = [],
  } = analytics;

  const expressionTotals = EXPRESSIONS.map((expr) => {
    const total = expressionTimeline.reduce(
      (sum, point) => sum + (point[expr.label.toLowerCase()] || 0),
      0,
    );
    return { ...expr, total };
  });

  const getEngagementColor = (score) => {
    if (score >= 70) return '#10b981';
    if (score >= 40) return '#f59e0b';
    if (score > 0) return '#ef4444';
    return '#6b7280';
  };

  const handleSummaryClick = async () => {
    if (!meetingId) return;
    try {
      setShowSummaryCard(true);
      setSummaryLoading(true);
      setSummaryError('');
      setSummary('');
      setNoteReport(null);
      const data = await aiNotesService.getMeetingNotes(meetingId);
      const notesArray = data?.notes || [];
      if (!notesArray.length) {
        setSummaryError('No AI notes found for this meeting yet.');
        return;
      }
      const latest = notesArray[0];
      setNoteReport(latest);
      setSummary(latest.summary || latest.rawContent || 'Summary is not available for this note.');
    } catch (err) {
      setSummaryError(err?.message || 'Failed to load meeting summary.');
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleDownloadReport = () => {
    if (!noteReport) return;

    const lines = [];
    lines.push('Meeting Report');
    lines.push('');
    lines.push(`Title: ${noteReport.title || ''}`);
    lines.push('');
    lines.push('Summary:');
    lines.push(noteReport.summary || '');
    lines.push('');
    lines.push('Key Timestamps:');
    (noteReport.key_timestamps || []).forEach((t) => {
      lines.push(`- ${t.ts || ''} - ${t.note || ''}`);
    });
    lines.push('');
    lines.push('Transcript Snippets:');
    (noteReport.transcript_snippets || []).forEach((s) => {
      lines.push(`- ${s}`);
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meeting-${meetingId}-report.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-900/40 shadow-2xl p-6 md:p-8 mb-10">
          <div className="absolute inset-0 opacity-50">
            <div className="absolute -top-16 -right-12 h-48 w-48 bg-purple-500/30 blur-[130px]" />
            <div className="absolute -bottom-12 -left-6 h-40 w-40 bg-sky-500/30 blur-[110px]" />
          </div>
          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/10 border border-white/20 text-xs uppercase tracking-[0.3em] text-slate-100">
                <Activity size={14} /> Live Insights
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-white mt-4 mb-2">Meeting Analytics</h1>
              <p className="text-slate-200 max-w-2xl">
                Dive into expression tracking, engagement trends, and participant performance captured by the emotion detection engine.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <AnalyticsCard
            title="Duration"
            value={formatDuration(duration)}
            icon={Clock}
            color="primary"
          />
          <AnalyticsCard
            title="Participants"
            value={participants.length}
            icon={Users}
            color="secondary"
          />
          <AnalyticsCard
            title=""
            value={summaryLoading ? 'Loading...' : 'Meeting Summary'}
            subtitle={
              summaryError
                || (summaryLoading
                  ? 'Loading summary...'
                  : 'Click to view AI meeting summary')
            }
            icon={TrendingUp}
            color="success"
            onClick={handleSummaryClick}
          />
        </div>

        {showSummaryCard && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="max-w-2xl w-full mx-4 rounded-3xl border border-white/10 bg-slate-900/90 backdrop-blur-xl shadow-2xl p-6 md:p-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Meeting Report</h2>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleDownloadReport}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/10 text-slate-100 hover:bg-white/20 border border-white/20"
                    disabled={!noteReport}
                  >
                    ↓ Download
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSummaryCard(false)}
                    className="text-sm text-slate-300 hover:text-white"
                  >
                    Close
                  </button>
                </div>
              </div>

              {summaryLoading && (
                <p className="text-slate-300">Loading summary...</p>
              )}

              {!summaryLoading && summaryError && (
                <p className="text-rose-400">{summaryError}</p>
              )}

              {!summaryLoading && !summaryError && noteReport && (
                <div className="space-y-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Title</p>
                    <p className="mt-1 text-lg font-semibold text-white">
                      {noteReport.title || '—'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">Summary</p>
                    <p className="text-slate-200 leading-relaxed whitespace-pre-line">
                      {noteReport.summary || summary || 'No summary available.'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">Key Timestamps</p>
                    {noteReport.key_timestamps && noteReport.key_timestamps.length > 0 ? (
                      <ul className="space-y-1 text-sm text-slate-200">
                        {noteReport.key_timestamps.map((item, idx) => (
                          <li key={`${item.ts}-${idx}`}>
                            <span className="font-medium text-sky-300">{item.ts}</span>
                            {item.note ? ` - ${item.note}` : ''}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-400">No key timestamps available.</p>
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">Transcript Snippets</p>
                    {noteReport.transcript_snippets && noteReport.transcript_snippets.length > 0 ? (
                      <ul className="space-y-1 text-sm text-slate-200">
                        {noteReport.transcript_snippets.map((snippet, idx) => (
                          <li key={idx}>• {snippet}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-400">No transcript snippets available.</p>
                    )}
                  </div>
                </div>
              )}

              {!summaryLoading && !summaryError && !noteReport && (
                <p className="text-slate-300">No AI meeting summary available yet.</p>
              )}
            </div>
          </div>
        )}

        <div className="rounded-3xl border border-white/10 bg-slate-900/70 backdrop-blur-xl shadow-2xl p-6 md:p-8 mb-10">
          <h2 className="text-xl font-bold text-white mb-6">Expression Timeline</h2>
          <div className="space-y-4">
            {expressionTimeline.map((point, index) => (
              <div key={index} className="flex items-center gap-4">
                <span className="text-sm font-medium text-slate-300 w-16">
                  {point.timestamp}
                </span>
                <div className="flex-1 bg-white/10 rounded-full h-8 relative overflow-hidden">
                  {(() => {
                    const total = Object.values(point).reduce((sum, val) =>
                      typeof val === 'number' ? sum + val : sum,
                    0);
                    if (total === 0) return null;

                    let start = 0;
                    return EXPRESSIONS.map((expr) => {
                      const count = point[expr.label.toLowerCase()] || 0;
                      const percentage = total > 0 ? (count / total) * 100 : 0;
                      if (percentage <= 0) return null;

                      const segment = (
                        <div
                          key={`${expr.label}-${start}`}
                          className="absolute inset-y-0 flex items-center justify-center text-xs font-semibold text-white"
                          style={{
                            left: `${start}%`,
                            width: `${percentage}%`,
                            backgroundColor: expr.color,
                          }}
                          title={`${expr.label}: ${Math.round(percentage)}%`}
                        >
                          {percentage >= 12 ? expr.emoji : ''}
                        </div>
                      );

                      start += percentage;
                      return segment;
                    });
                  })()}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/70 backdrop-blur-xl shadow-2xl p-6 md:p-8 mb-10">
          <h2 className="text-xl font-bold text-white mb-6">Expression Breakdown</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {expressionTotals.map((expr) => (
              <div key={expr.label} className="rounded-2xl border border-white/10 bg-white/5/70 p-4 text-center">
                <span className="text-2xl mb-1 block">{expr.emoji}</span>
                <p className="text-sm text-slate-300">{expr.label}</p>
                <p className="text-lg font-bold" style={{ color: expr.color }}>
                  {expr.total}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/70 backdrop-blur-xl shadow-2xl p-6 md:p-8">
          <h2 className="text-xl font-bold text-white mb-6">Participant Details</h2>
          <div className="space-y-4">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="border border-white/10 rounded-2xl p-5 bg-white/5/70 hover:bg-white/10 transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-white">{participant.name}</h3>
                    <p className="text-sm text-slate-300">
                      Active: {formatDuration(participant.activeTime)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-300">Engagement Score</p>
                    <p
                      className="text-2xl font-bold"
                      style={{ color: getEngagementColor(participant.engagementScore) }}
                    >
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
                        className="rounded-xl p-3 text-center border"
                        style={{
                          // Always tint tile with the expression color so each
                          // emoji card visually shows its condition
                          backgroundColor: expr?.color
                            ? `${expr.color}1A`
                            : 'rgba(15,23,42,0.7)',
                          borderColor: expr?.color
                            ? expr.color
                            : 'rgba(148,163,184,0.25)',
                        }}
                      >
                        <span className="text-2xl mb-1 block">{expr?.emoji}</span>
                        <p className="text-xs text-slate-200 mb-1">{expr?.label}</p>
                        <p
                          className="text-sm font-bold"
                          style={{ color: expr?.color || '#9ca3af' }}
                        >
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
