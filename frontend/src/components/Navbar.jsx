import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Video, LogOut, Settings, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { APP_NAME } from '../utils/constants';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center"
            >
              <Video className="text-white" size={24} />
            </motion.div>
            <span className="text-2xl font-bold text-gradient">{APP_NAME}</span>
          </Link>

          {isAuthenticated && (
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-primary-600 transition-colors"
              >
                <LayoutDashboard size={20} />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>

              <Link
                to="/settings"
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-primary-600 transition-colors"
              >
                <Settings size={20} />
                <span className="hidden sm:inline">Settings</span>
              </Link>

              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="flex items-center gap-2">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full border-2 border-primary-500"
                  />
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
                <button className="px-6 py-2 text-primary-600 hover:text-primary-700 font-medium">
                  Login
                </button>
              </Link>
              <Link to="/signup">
                <button className="px-6 py-2 btn-gradient rounded-xl">
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
