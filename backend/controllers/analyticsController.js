// Frontend: src/services/analyticsService.js
import Analytics from '../models/Analytics.js';
import Emotion from '../models/Emotion.js';
import Meeting from '../models/Meeting.js';

const EXPRESSION_KEYS = ['happy', 'neutral', 'confused', 'surprised', 'bored'];
const EXPRESSION_WEIGHTS = {
  happy: 1,
  surprised: 0.85,
  neutral: 0.5,
  confused: 0.3,
  bored: 0,
};

const createExpressionBucket = () =>
  EXPRESSION_KEYS.reduce((acc, key) => ({ ...acc, [key]: 0 }), {});

// GET /api/analytics/:meetingId
export const getMeetingAnalytics = async (req, res, next) => {
  try {
    const { meetingId } = req.params;

    // If we already have a cached analytics document, return it
    const analyticsDoc = await Analytics.findOne({ meetingId });
    if (analyticsDoc) {
      return res.json(analyticsDoc);
    }

    const [meeting, emotions] = await Promise.all([
      Meeting.findById(meetingId).lean(),
      Emotion.find({ meeting_id: meetingId }).sort({ timestamp: 1 }).lean(),
    ]);

    if (!meeting && emotions.length === 0) {
      return res.json({});
    }

    const createdAt = meeting?.createdAt ? new Date(meeting.createdAt) : null;
    const endedAt = meeting?.endedAt ? new Date(meeting.endedAt) : null;
    const durationSeconds = createdAt
      ? Math.max(0, Math.round(((endedAt || Date.now()) - createdAt) / 1000))
      : 0;

    // Build expression timeline grouped per minute
    const timelineMap = new Map();
    const participantMap = new Map();

    const getParticipantName = (participantId, idx) => {
      if (!participantId) return 'Audience';
      const meetingParticipant = meeting?.participants?.find(
        (p) => p.userId?.toString() === participantId,
      );
      if (meetingParticipant?.name) return meetingParticipant.name;
      return `Participant ${idx + 1}`;
    };

    emotions.forEach((emotion, idx) => {
      const ts = new Date(emotion.timestamp || Date.now());
      ts.setSeconds(0, 0);
      const bucketKey = ts.getTime();
      if (!timelineMap.has(bucketKey)) {
        timelineMap.set(bucketKey, {
          timestamp: ts.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          ...createExpressionBucket(),
        });
      }
      const bucket = timelineMap.get(bucketKey);
      const exprKey = (emotion.emotion || 'unknown').toLowerCase();
      if (bucket[exprKey] !== undefined) {
        bucket[exprKey] += 1;
      }

      const participantId = emotion.participant_id || 'audience';
      if (!participantMap.has(participantId)) {
        participantMap.set(participantId, {
          id: participantId,
          name: getParticipantName(participantId, participantMap.size),
          activeTime: durationSeconds,
          engagementScore: 0,
          expressions: createExpressionBucket(),
        });
      }
      const participant = participantMap.get(participantId);
      if (participant.expressions[exprKey] !== undefined) {
        participant.expressions[exprKey] += 1;
      }
    });

    const expressionTimeline = Array.from(timelineMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([, value]) => value);

    const participants = Array.from(participantMap.values()).map((participant) => {
      const total = Object.values(participant.expressions).reduce((sum, val) => sum + val, 0);
      const normalizedExpressions = { ...participant.expressions };
      if (total > 0) {
        Object.keys(normalizedExpressions).forEach((key) => {
          normalizedExpressions[key] = Math.round((normalizedExpressions[key] / total) * 100);
        });
      }

      const weightedScore = Object.entries(EXPRESSION_WEIGHTS).reduce((sum, [key, weight]) => (
        sum + (normalizedExpressions[key] || 0) * weight
      ), 0);
      return {
        ...participant,
        engagementScore: total > 0 ? Math.min(100, Math.round(weightedScore)) : 0,
        expressions: normalizedExpressions,
      };
    });

    const overallEngagement = participants.length
      ? Math.round(
          participants.reduce((sum, p) => sum + (p.engagementScore || 0), 0) / participants.length,
        )
      : 0;

    const response = {
      meetingId,
      title: meeting?.topic || 'Meeting',
      duration: durationSeconds,
      participants,
      overallEngagement,
      expressionTimeline,
    };

    res.json(response);
  } catch (err) { next(err); }
};

// POST /api/analytics/update
export const updateAnalytics = async (req, res, next) => {
  // Placeholder: implement analytics sync logic from client side
  res.json({ message: 'Activity updated (placeholder)' });
};

// GET /api/analytics/summary/:userId
export const getUserAnalytics = async (req, res, next) => {
  // Placeholder: implement aggregation logic per user
  res.json({ summary: null });
};
