import React, { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Video, Plus, LogIn, TrendingUp, Users, Clock } from 'lucide-react';
import Button from '../components/Button';
import Navbar from '../components/Navbar';
import { useAuth } from '../hooks/useAuth';
import { TypeAnimation } from 'react-type-animation';

// subtle animated web-like background using canvas
const WebBackground = () => {
  const canvasRef = useRef(null);
  const animationFrameId = useRef();
  const particlesRef = useRef([]);

  const MAX_PARTICLES = 70;
  const PARTICLE_RADIUS = 1.2;
  const CONNECTION_DISTANCE = 170;

  const initParticles = useCallback((width, height) => {
    const particles = [];
    for (let i = 0; i < MAX_PARTICLES; i += 1) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,

        r: PARTICLE_RADIUS,
      });
    }
    particlesRef.current = particles;
  }, []);

  const draw = useCallback((ctx, width, height) => {
    ctx.clearRect(0, 0, width, height);

    const particles = particlesRef.current;

    particles.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.95)';

      ctx.fill();

      for (let j = i + 1; j < particles.length; j += 1) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.hypot(dx, dy);
        if (dist < CONNECTION_DISTANCE) {
          const opacity = 1 - dist / CONNECTION_DISTANCE;
          ctx.strokeStyle = `rgba(255,255,255,${opacity * 0.65})`;

          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext('2d');

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles(canvas.width, canvas.height);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const animate = () => {
      draw(ctx, canvas.width, canvas.height);
      animationFrameId.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [draw, initParticles]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 opacity-75 md:opacity-95 transition-opacity duration-700"
    />
  );
};

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
    <div className="min-h-screen bg-slate-950 text-white relative">
      {/* full-screen floating web behind the whole page */}
      <WebBackground />

      <Navbar />

      {/* content above the web */}
      <section className="relative overflow-hidden min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 border border-white/10 bg-white/5/30 backdrop-blur rounded-full text-[0.65rem] md:text-xs tracking-[0.45em] uppercase text-slate-200/80 mb-6"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Next-Gen Meetings
            </motion.div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-white drop-shadow-[0_0_35px_rgba(56,189,248,0.35)]">
                Video Meetings with
              </span>
              <span className="relative inline-flex items-center justify-center mt-2">
                <span
                  className="absolute inset-x-0 bottom-0 h-5 bg-gradient-to-r from-sky-500/30 via-indigo-500/30 to-purple-500/30 blur-3xl opacity-70"
                  aria-hidden="true"
                />
                <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500">
                  AI-Powered Insights
                </span>
              </span>
            </h1>

            <TypeAnimation
              sequence={[
                'Experience next-generation video conferencing.',
                1000,
                'Experience real-time face expression tracking.',
                1000,
                'Experience post-meeting analytics.',
                1000,
              ]}
              wrapper="p"
              cursor
              repeat={Infinity}
              className="text-xl text-slate-200 mb-10 max-w-2xl mx-auto"
              style={{ minHeight: '3.5rem' }}
            />

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
                    variant="outline"
                    size="lg"
                    onClick={() => navigate('/join-meeting')}
                    className="w-full sm:w-auto border-white/70 text-white hover:bg-white/10 hover:border-white"
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
                    variant="outline"
                    size="lg"
                    onClick={() => navigate('/login')}
                    className="w-full sm:w-auto border-white/70 text-white hover:bg-white/10 hover:border-white"
                  >
                    Sign In
                  </Button>
                </>
              )}
            </div>
          </motion.div>

          {/* Preview area with multiple call cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 border border-white/10 rounded-3xl shadow-2xl backdrop-blur-md p-6 md:p-8 mb-16 max-w-5xl mx-auto"
          >
            <div className="relative aspect-[16/9] md:aspect-[16/7] max-w-4xl mx-auto rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-500/20 via-sky-500/10 to-purple-500/20 scale-90 md:scale-95">
              {/* soft background glows */}
              <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -bottom-32 right-0 h-72 w-72 rounded-full bg-purple-500/30 blur-3xl" />

              {/* left incoming call card */}
              <motion.div
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                className="absolute left-4 top-8 w-56 rounded-3xl bg-slate-950/90 border border-white/10 shadow-xl p-4 flex flex-col justify-between"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-sky-500 flex items-center justify-center text-white font-semibold">
                    MS
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-300">MeetSense</span>
                    <span className="text-sm font-semibold text-white">Video Call</span>
                  </div>
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="h-14 w-14 rounded-full border-4 border-emerald-500/80 bg-slate-800 animate-pulse" />
                </div>
                <div className="mt-4">
                  <p className="text-sm text-slate-200 mb-3">
                    Dianne is requesting a video call…
                  </p>
                  <div className="flex justify-center gap-3">
                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.9 }}
                      className="h-9 w-9 rounded-full bg-red-500 flex items-center justify-center text-white text-base shadow-lg shadow-red-500/50"
                    >
                      ✕
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.9 }}
                      className="h-9 w-9 rounded-full bg-emerald-500 flex items-center justify-center text-white text-base shadow-lg shadow-emerald-500/50"
                    >
                      🎥
                    </motion.button>
                  </div>
                </div>
              </motion.div>

              {/* top-right team calling card */}
              <motion.div
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                className="absolute right-8 top-5 w-56 rounded-3xl bg-slate-950/90 border border-white/10 shadow-xl p-4 flex flex-col"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-2">
                    <span className="h-2 w-2 rounded-full bg-slate-500" />
                    <span className="h-2 w-2 rounded-full bg-slate-500" />
                    <span className="h-2 w-2 rounded-full bg-slate-500" />
                  </div>
                  <button className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center text-white text-sm">
                    ⏹
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <div className="h-8 w-8 rounded-full bg-emerald-500 border-2 border-slate-950" />
                    <div className="h-8 w-8 rounded-full bg-sky-500 border-2 border-slate-950" />
                    <div className="h-8 w-8 rounded-full bg-amber-500 border-2 border-slate-950" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Team Meeting</p>
                    <p className="text-xs text-slate-300">Video calling…</p>
                  </div>
                </div>
              </motion.div>

              {/* bottom live meeting preview card */}
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className="absolute left-1/2 bottom-3 w-[52%] -translate-x-1/2 rounded-3xl bg-slate-950/95 border border-white/10 shadow-2xl overflow-hidden"
              >
                <div className="h-32 bg-slate-800/60 flex items-center justify-center">
                  <div className="text-center">
                    <Video size={40} className="mx-auto mb-2 text-white" />
                    <p className="text-sm text-slate-200">Live Meeting Preview</p>
                  </div>
                </div>
                <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/90">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Connected</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-200">
                    <motion.span
                      whileHover={{ scale: 1.06 }}
                      whileTap={{ scale: 0.9 }}
                      className="h-7 w-7 rounded-full bg-slate-800 flex items-center justify-center text-xs"
                    >
                      🎙
                    </motion.span>
                    <motion.span
                      whileHover={{ scale: 1.06 }}
                      whileTap={{ scale: 0.9 }}
                      className="h-7 w-7 rounded-full bg-slate-800 flex items-center justify-center text-xs"
                    >
                      🎥
                    </motion.span>
                    <motion.span
                      whileHover={{ scale: 1.06 }}
                      whileTap={{ scale: 0.9 }}
                      className="h-7 w-7 rounded-full bg-red-500 flex items-center justify-center text-xs"
                    >
                      ⏹
                    </motion.span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Features grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-2xl shadow-lg backdrop-blur-md p-6 hover:shadow-xl transition-shadow"
              >
                <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-4">
                  <feature.icon size={24} className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-200 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;