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
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-900/40 shadow-2xl p-6 md:p-8 mb-10 text-center">
          <div className="absolute inset-0 opacity-50">
            <div className="absolute -top-10 right-0 h-32 w-32 bg-purple-500/30 blur-[120px]" />
            <div className="absolute -bottom-14 left-2 h-28 w-28 bg-sky-500/30 blur-[100px]" />
          </div>
          <div className="relative">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary-500/30">
              <Video size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Create New Meeting</h1>
            <p className="text-slate-200">Set up a new video conference with AI-powered analytics</p>
          </div>
        </div>

        {!generatedMeeting ? (
          <div className="rounded-3xl border border-white/10 bg-slate-900/70 backdrop-blur-xl shadow-2xl p-6 md:p-8">
            <InputField
              label="Meeting Title"
              placeholder="e.g., Team Standup, Client Presentation"
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
              icon={Video}
              required
            />

            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3 text-slate-300">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Clock size={18} className="text-white" />
                </div>
                <span>Unlimited duration</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Users size={18} className="text-white" />
                </div>
                <span>Unlimited participants</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Video size={18} className="text-white" />
                </div>
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
          <div className="rounded-3xl border border-white/10 bg-slate-900/70 backdrop-blur-xl shadow-2xl p-6 md:p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/40">
                <Check size={32} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Meeting Created!</h2>
              <p className="text-slate-300">{generatedMeeting.title}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5/80 p-4 mb-6">
              <p className="text-sm text-slate-300 mb-2">Meeting Link</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={`${window.location.origin}/meeting/${generatedMeeting.id}`}
                  readOnly
                  className="flex-1 px-4 py-2 rounded-xl bg-slate-950/60 border border-white/10 text-sm text-white"
                />
                <Button
                  variant="outline"
                  onClick={handleCopyLink}
                  className="flex-shrink-0 border-white/30 text-white hover:bg-white/10"
                >
                  {copied ? <Check size={20} /> : <Copy size={20} />}
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                className="flex-1"
                onClick={handleStartMeeting}
              >
                Start Meeting
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate('/dashboard')}
                className="flex-1 bg-white/10 text-white border-white/30 hover:bg-white/20"
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
