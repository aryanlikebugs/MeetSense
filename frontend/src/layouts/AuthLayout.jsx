import { motion } from 'framer-motion';
import { Video } from 'lucide-react';
import { APP_NAME } from '../utils/constants';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
            className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-2xl flex items-center justify-center"
          >
            <Video className="text-white" size={32} />
          </motion.div>
          <h1 className="text-3xl font-bold text-gradient mb-2">{APP_NAME}</h1>
          {title && <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>}
          {subtitle && <p className="text-gray-600">{subtitle}</p>}
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

export default AuthLayout;
