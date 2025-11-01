import { useState } from 'react';
import ChatBox from '../components/ChatBox';
import ControlBar from '../components/ControlBar';
import NotificationToast from '../components/NotificationToast';

const MeetingLayout = ({ children }) => {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900 relative">
      <main className="pb-24">
        {children}
      </main>
      <ControlBar onChatToggle={() => setChatOpen(!chatOpen)} />
      <ChatBox isOpen={chatOpen} onClose={() => setChatOpen(false)} />
      <NotificationToast />
    </div>
  );
};

export default MeetingLayout;
