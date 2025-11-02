import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Video, Clock, Users, Copy, Check } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import InputField from '../components/InputField';
import Button from '../components/Button';
import { useMeeting } from '../hooks/useMeeting';
import { useNotifications } from '../hooks/useNotifications';

const CreateMeeting = () => {
  const navigate = useNavigate();
  const { createMeeting } = useMeeting();
  const { showSuccess, showInfo, showError } = useNotifications();

  const [meetingTitle, setMeetingTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedMeeting, setGeneratedMeeting] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleCreateMeeting = async () => {
    if (!meetingTitle.trim()) {
      return;
    }

    setLoading(true);

    try {
      const meeting = await createMeeting({
        topic: meetingTitle,
      });

      if (meeting && (meeting._id || meeting.id)) {
        setGeneratedMeeting({
          id: meeting._id || meeting.id,
          title: meeting.topic || meetingTitle,
        });
        showSuccess('Meeting created successfully!');
      } else {
        showError('Failed to create meeting. Please try again.');
      }
    } catch (error) {
      console.error('Error creating meeting:', error);
      showError('Failed to create meeting. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    const meetingLink = `${window.location.origin}/meeting/${generatedMeeting.id}`;
    navigator.clipboard.writeText(meetingLink);
    setCopied(true);
    showInfo('Meeting link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartMeeting = () => {
    navigate(`/meeting/${generatedMeeting.id}`);
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
            <Video size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Meeting</h1>
          <p className="text-gray-600">Set up a new video conference with AI-powered analytics</p>
        </div>

        {!generatedMeeting ? (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <InputField
              label="Meeting Title"
              placeholder="e.g., Team Standup, Client Presentation"
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
              icon={Video}
              required
            />

            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3 text-gray-600">
                <Clock size={20} />
                <span>Unlimited duration</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Users size={20} />
                <span>Unlimited participants</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Video size={20} />
                <span>HD video quality</span>
              </div>
            </div>

            <Button
              className="w-full mt-8"
              onClick={handleCreateMeeting}
              disabled={!meetingTitle.trim() || loading}
            >
              {loading ? 'Creating...' : 'Create Meeting'}
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <Check size={32} className="text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Meeting Created!</h2>
              <p className="text-gray-600">{generatedMeeting.title}</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-600 mb-2">Meeting Link</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={`${window.location.origin}/meeting/${generatedMeeting.id}`}
                  readOnly
                  className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                />
                <Button
                  variant="outline"
                  onClick={handleCopyLink}
                  className="flex-shrink-0"
                >
                  {copied ? <Check size={20} /> : <Copy size={20} />}
                </Button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                className="flex-1"
                onClick={handleStartMeeting}
              >
                Start Meeting
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate('/dashboard')}
                className="flex-1"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default CreateMeeting;
