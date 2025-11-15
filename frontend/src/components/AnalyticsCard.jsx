import { motion } from 'framer-motion';

const AnalyticsCard = ({ title, value, subtitle, icon: Icon, color = 'primary', onClick }) => {
  const colorClasses = {
    primary: 'from-sky-500/80 via-indigo-500/80 to-purple-500/80',
    secondary: 'from-cyan-400/80 to-sky-500/80',
    success: 'from-emerald-400/80 to-green-500/80',
    warning: 'from-amber-400/80 to-orange-500/80',
    danger: 'from-rose-500/80 to-red-500/80',
  };

  return (
    <motion.div
      whileHover={{ scale: onClick ? 1.03 : 1.02, y: -5 }}
      className={`rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-6 hover:border-white/20 hover:shadow-2xl transition-all ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          {title && (
            <p className="text-slate-300 text-sm font-medium mb-1">{title}</p>
          )}
          <h3 className="text-3xl font-bold text-white">{value}</h3>
          {subtitle && (
            <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-2xl bg-gradient-to-br ${colorClasses[color]} shadow-lg shadow-black/20`}>
            <Icon size={24} className="text-white" />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AnalyticsCard;
