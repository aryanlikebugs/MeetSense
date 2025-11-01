import { useContext } from 'react';
import { UIContext } from '../context/UIContext';

export const useNotifications = () => {
  const context = useContext(UIContext);

  if (!context) {
    throw new Error('useNotifications must be used within a UIProvider');
  }

  return {
    showSuccess: context.showSuccess,
    showError: context.showError,
    showInfo: context.showInfo,
    notifications: context.notifications,
  };
};
