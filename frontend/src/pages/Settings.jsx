import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Bell, Video, Shield } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import InputField from '../components/InputField';
import Button from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';

const Settings = () => {
  const { user } = useAuth();
  const { showSuccess } = useNotifications();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const [preferences, setPreferences] = useState({
    notifications: true,
    autoRecording: false,
    expressionTracking: true,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePreferenceChange = (key) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    showSuccess('Profile updated successfully!');
  };

  const handleSavePreferences = (e) => {
    e.preventDefault();
    showSuccess('Preferences updated successfully!');
  };

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account and preferences</p>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                <User size={20} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6">
              <InputField
                label="Full Name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                icon={User}
              />

              <InputField
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                icon={Mail}
                disabled
              />

              <Button type="submit">
                Save Profile
              </Button>
            </form>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                <Video size={20} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Meeting Preferences</h2>
            </div>

            <form onSubmit={handleSavePreferences} className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Bell size={20} className="text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">Notifications</p>
                      <p className="text-sm text-gray-600">
                        Receive meeting reminders and updates
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePreferenceChange('notifications')}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      preferences.notifications ? 'bg-primary-600' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${
                        preferences.notifications ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Video size={20} className="text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">Auto Recording</p>
                      <p className="text-sm text-gray-600">
                        Automatically record all meetings
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePreferenceChange('autoRecording')}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      preferences.autoRecording ? 'bg-primary-600' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${
                        preferences.autoRecording ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Shield size={20} className="text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">Expression Tracking</p>
                      <p className="text-sm text-gray-600">
                        Enable AI-based face expression analysis
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePreferenceChange('expressionTracking')}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      preferences.expressionTracking ? 'bg-primary-600' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${
                        preferences.expressionTracking ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <Button type="submit">
                Save Preferences
              </Button>
            </form>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Settings;
