export const calculateActiveTime = (joinTime, leaveTime) => {
  if (!joinTime || !leaveTime) return 0;

  const join = new Date(joinTime);
  const leave = new Date(leaveTime);
  const diffMs = leave - join;

  return Math.floor(diffMs / 1000);
};

export const calculateEngagementScore = (expressions) => {
  if (!expressions || expressions.length === 0) return 0;

  const weights = {
    happy: 1.0,
    surprised: 0.8,
    neutral: 0.5,
    confused: 0.3,
    bored: 0.1,
  };

  const totalScore = expressions.reduce((acc, expr) => {
    const weight = weights[expr.type.toLowerCase()] || 0.5;
    return acc + weight;
  }, 0);

  return Math.round((totalScore / expressions.length) * 100);
};

export const getEngagementLevel = (score) => {
  if (score >= 80) return { level: 'High', color: 'text-green-600' };
  if (score >= 60) return { level: 'Medium', color: 'text-yellow-600' };
  return { level: 'Low', color: 'text-red-600' };
};
