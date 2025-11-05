import NotificationToast from '../components/NotificationToast';

const MeetingLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-900 relative">
      <main className="pb-24">
        {children}
      </main>
      <NotificationToast />
    </div>
  );
};

export default MeetingLayout;
