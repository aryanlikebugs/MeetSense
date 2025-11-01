import { useState, useEffect } from 'react';

export const useAnalytics = (meetingId) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        // TODO: Backend integration - GET /api/analytics/meetings/:id

        const mockAnalytics = {
          meetingId,
          duration: 2700,
          participants: [
            {
              id: '1',
              name: 'John Doe',
              joinTime: '2024-01-15T10:00:00Z',
              leaveTime: '2024-01-15T10:45:00Z',
              activeTime: 2700,
              engagementScore: 85,
              expressions: {
                happy: 60,
                neutral: 30,
                confused: 5,
                bored: 5,
              },
            },
            {
              id: '2',
              name: 'Jane Smith',
              joinTime: '2024-01-15T10:02:00Z',
              leaveTime: '2024-01-15T10:45:00Z',
              activeTime: 2580,
              engagementScore: 78,
              expressions: {
                happy: 50,
                neutral: 35,
                confused: 10,
                bored: 5,
              },
            },
          ],
          overallEngagement: 82,
          expressionTimeline: [
            { timestamp: '10:00', happy: 2, neutral: 0, confused: 0, bored: 0 },
            { timestamp: '10:15', happy: 1, neutral: 1, confused: 0, bored: 0 },
            { timestamp: '10:30', happy: 1, neutral: 0, confused: 1, bored: 0 },
            { timestamp: '10:45', happy: 2, neutral: 0, confused: 0, bored: 0 },
          ],
        };

        setTimeout(() => {
          setAnalytics(mockAnalytics);
          setLoading(false);
        }, 500);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (meetingId) {
      fetchAnalytics();
    }
  }, [meetingId]);

  return { analytics, loading, error };
};
