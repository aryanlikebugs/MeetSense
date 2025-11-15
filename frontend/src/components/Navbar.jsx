import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Video, LogOut, Settings, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { APP_NAME } from '../utils/constants';

const Navbar = () => {
  const [logoHover, setLogoHover] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const avatarUrl = user
    ? user.avatar ||
      `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.name || 'User')}`
    : '';

  return (
    <nav className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: logoHover ? 360 : 0 }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center"
            >
              <Video className="text-white" size={24} />
            </motion.div>
            <span
              className="text-2xl font-bold text-gradient"
              onMouseEnter={() => setLogoHover(true)}
              onMouseLeave={() => setLogoHover(false)}
            >
              {APP_NAME}
            </span>
          </Link>

          {isAuthenticated && (
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-4 py-2 text-slate-200 hover:text-white transition-colors"
              >
                <LayoutDashboard size={20} />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>

              <Link
                to="/settings"
                className="flex items-center gap-2 px-4 py-2 text-slate-200 hover:text-white transition-colors"
              >
                <Settings size={20} />
                <span className="hidden sm:inline">Settings</span>
              </Link>

              <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                <div className="flex items-center gap-2">
                  <img
                    src={avatarUrl}
                    alt={user.name}
                    className="w-10 h-10 rounded-full border-2 border-primary-500 object-cover bg-slate-800"
                  />
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-white">{user.name}</p>
                    <p className="text-xs text-slate-300">{user.email}</p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </div>
          )}

          {!isAuthenticated && (
            <div className="flex items-center gap-3">
              <Link to="/login">
                <button className="px-6 py-2 text-slate-200 hover:text-white font-medium">
                  Login
                </button>
              </Link>
              <Link to="/signup">
                <button className="px-6 py-2 btn-gradient rounded-xl shadow-lg shadow-primary-500/40">
                  Sign Up
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
