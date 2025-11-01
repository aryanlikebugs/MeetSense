import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';

const NotificationToast = () => {
  const { notifications } = useNotifications();

  const icons = {
    success: <CheckCircle size={20} className="text-green-600" />,
    error: <XCircle size={20} className="text-red-600" />,
    info: <Info size={20} className="text-blue-600" />,
  };

  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border-2 ${bgColors[notification.type]} min-w-[300px]`}
          >
            {icons[notification.type]}
            <p className="flex-1 text-sm font-medium text-gray-900">
              {notification.message}
            </p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationToast;
