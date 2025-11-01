import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Video, Plus, LogIn, TrendingUp, Users, Clock } from 'lucide-react';
import Button from '../components/Button';
import Navbar from '../components/Navbar';
import { useAuth } from '../hooks/useAuth';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: Video,
      title: 'HD Video Conferencing',
      description: 'Crystal clear video and audio quality for seamless communication',
    },
    {
      icon: TrendingUp,
      title: 'AI-Powered Analytics',
      description: 'Track engagement and facial expressions in real-time',
    },
    {
      icon: Users,
      title: 'Unlimited Participants',
      description: 'Host meetings with as many people as you need',
    },
    {
      icon: Clock,
      title: 'Meeting History',
      description: 'Access past meeting recordings and analytics anytime',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <Navbar />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Video Meetings with
            <br />
            <span className="text-gradient">AI-Powered Insights</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Experience next-generation video conferencing with real-time face expression tracking
            and post-meeting analytics
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
              <>
                <Button
                  size="lg"
                  onClick={() => navigate('/create-meeting')}
                  className="w-full sm:w-auto"
                >
                  <Plus size={20} />
                  Start New Meeting
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => navigate('/join-meeting')}
                  className="w-full sm:w-auto"
                >
                  <LogIn size={20} />
                  Join Meeting
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="lg"
                  onClick={() => navigate('/signup')}
                  className="w-full sm:w-auto"
                >
                  Get Started Free
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => navigate('/login')}
                  className="w-full sm:w-auto"
                >
                  Sign In
                </Button>
              </>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-2xl p-8 mb-20"
        >
          <div className="aspect-video bg-gradient-to-br from-primary-100 to-secondary-100 rounded-2xl flex items-center justify-center">
            <div className="text-center">
              <Video size={80} className="mx-auto mb-4 text-primary-600" />
              <p className="text-gray-600">Meeting Preview</p>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-4">
                <feature.icon size={24} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
