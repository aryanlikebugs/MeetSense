import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Hash, User, LogIn } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import InputField from '../components/InputField';
import Button from '../components/Button';
import { useMeeting } from '../hooks/useMeeting';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { validateMeetingCode } from '../utils/validateInput';

const JoinMeeting = () => {
  const navigate = useNavigate();
  const { joinMeeting } = useMeeting();
  const { user } = useAuth();
  const { showError } = useNotifications();

  const [formData, setFormData] = useState({
    meetingCode: '',
    name: user?.name || '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleJoinMeeting = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!validateMeetingCode(formData.meetingCode)) {
      newErrors.meetingCode = 'Please enter a valid meeting code';
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Please enter your name';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const result = await joinMeeting(formData.meetingCode);
      if (result && (result._id || result.id)) {
        navigate(`/meeting/${formData.meetingCode}`);
      } else {
        showError('Failed to join meeting. Please check the meeting code.');
      }
    } catch (error) {
      console.error('Join meeting error:', error);
      showError('Failed to join meeting. Please check the meeting code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-2xl flex items-center justify-center">
            <LogIn size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Meeting</h1>
          <p className="text-gray-600">Enter the meeting code to join an existing meeting</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleJoinMeeting} className="space-y-6">
            <InputField
              label="Meeting Code"
              type="text"
              name="meetingCode"
              placeholder="abc-xyz-123"
              value={formData.meetingCode}
              onChange={handleChange}
              error={errors.meetingCode}
              icon={Hash}
              required
            />

            <InputField
              label="Your Name"
              type="text"
              name="name"
              placeholder="Enter your display name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              icon={User}
              required
            />

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Joining...' : 'Join Meeting'}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have a meeting code?{' '}
              <button
                onClick={() => navigate('/create-meeting')}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Create a new meeting
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default JoinMeeting;
