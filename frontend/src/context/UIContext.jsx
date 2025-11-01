import { createContext, useState } from 'react';

export const UIContext = createContext();

export const UIProvider = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleChat = () => {
    setChatOpen(!chatOpen);
  };

  const addNotification = (notification) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = {
      id,
      ...notification,
      timestamp: new Date().toISOString(),
    };

    setNotifications((prev) => [...prev, newNotification]);

    setTimeout(() => {
      removeNotification(id);
    }, notification.duration || 5000);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const showSuccess = (message) => {
    addNotification({ type: 'success', message });
  };

  const showError = (message) => {
    addNotification({ type: 'error', message });
  };

  const showInfo = (message) => {
    addNotification({ type: 'info', message });
  };

  const value = {
    sidebarOpen,
    chatOpen,
    notifications,
    loading,
    setLoading,
    toggleSidebar,
    toggleChat,
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showInfo,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};
