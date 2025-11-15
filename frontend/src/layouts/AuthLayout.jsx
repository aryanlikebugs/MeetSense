import { motion } from 'framer-motion';
import { Video } from 'lucide-react';
import { APP_NAME } from '../utils/constants';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-slate-950 overflow-hidden relative flex items-center justify-center px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.35),_transparent_45%),radial-gradient(circle_at_bottom,_rgba(14,116,144,0.35),_transparent_40%)]" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'1600\' height=\'900\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3ClinearGradient id=\'g\' x1=\'0%%\' y1=\'0%%\' x2=\'0%%\' y2=\'100%%\'%3E%3Cstop stop-color=\'%23ffffff0f\'/%3E%3Cstop offset=\'1\' stop-color=\'%2300000000\'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=\'1600\' height=\'900\' fill=\'url(%23g)\'/%3E%3Cpath d=\'M0 700 Q800 600 1600 700 L1600 900 L0 900 Z\' fill=\'%231e293b26\'/%3E%3C/svg%3E')] opacity-60" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
            className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-gradient-to-br from-sky-400 via-indigo-500 to-purple-600 shadow-[0_20px_50px_rgba(59,130,246,0.45)] flex items-center justify-center"
          >
            <Video className="text-white" size={34} />
          </motion.div>
          <p className="text-sm uppercase tracking-[0.35em] text-white/70 mb-2">{APP_NAME}</p>
          {title && <h2 className="text-3xl font-bold text-white mb-1">{title}</h2>}
          {subtitle && <p className="text-sm text-white/70">{subtitle}</p>}
        </div>

        <div className="rounded-3xl border border-white/15 bg-white/10 backdrop-blur-2xl shadow-[0_20px_50px_rgba(15,23,42,0.65)] p-8">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

export default AuthLayout;
