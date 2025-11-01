import { motion } from 'framer-motion';

const AnalyticsCard = ({ title, value, subtitle, icon: Icon, color = 'primary' }) => {
  const colorClasses = {
    primary: 'from-primary-500 to-primary-600',
    secondary: 'from-secondary-500 to-secondary-600',
    success: 'from-green-500 to-green-600',
    warning: 'from-yellow-500 to-yellow-600',
    danger: 'from-red-500 to-red-600',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 border border-gray-100"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl bg-linear-to-br ${colorClasses[color]}`}>
            <Icon size={24} className="text-white" />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AnalyticsCard;
