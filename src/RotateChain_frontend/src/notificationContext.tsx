import React, { createContext, useState,useEffect , useContext, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (type: Notification['type'], message: string) => void;
  removeNotification: (id: number) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

interface NotificationProps {
  notification: {
    id: number;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
  };
  removeNotification: (id: number) => void;
}

const Notification: React.FC<NotificationProps> = ({ 
  notification, 
  removeNotification 
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      removeNotification(notification.id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [notification.id, removeNotification]);

  const getBgColor = (): string => {
    switch (notification.type) {
      case 'success': return 'bg-emerald-500';
      case 'error': return 'bg-rose-500';
      case 'warning': return 'bg-amber-500';
      case 'info': return 'bg-sky-500';
      default: return 'bg-indigo-500';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.3 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
        className={`${getBgColor()} text-white rounded-xl shadow-xl p-4 mb-3 w-full max-w-md mx-auto`}
      >
        <div className="flex items-start">
          <div className="flex-1">
            <h3 className="font-bold text-lg capitalize">{notification.type}</h3>
            <p className="mt-1 text-sm">{notification.message}</p>
          </div>
          <button 
            onClick={() => removeNotification(notification.id)}
            className="text-white hover:text-gray-200 transition-colors"
            aria-label="Close notification"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (type: Notification['type'], message: string) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, type, message }]);
  };

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const contextValue: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    success: (message) => addNotification('success', message),
    error: (message) => addNotification('error', message),
    warning: (message) => addNotification('warning', message),
    info: (message) => addNotification('info', message)
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      
      <div className="fixed top-4 right-4 z-50 w-full max-w-xs space-y-2">
        {notifications.map(notification => (
          <Notification 
            key={notification.id} 
            notification={notification}
            removeNotification={removeNotification} 
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};