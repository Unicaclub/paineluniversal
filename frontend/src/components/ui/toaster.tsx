import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../stores/uiStore';

export const Toaster: React.FC = () => {
  const { notifications, removeNotification } = useUIStore();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 100, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`
              max-w-sm p-4 rounded-lg shadow-lg border
              ${notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : ''}
              ${notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : ''}
              ${notification.type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' : ''}
              ${notification.type === 'info' ? 'bg-blue-50 border-blue-200 text-blue-800' : ''}
            `}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium">{notification.title}</h4>
                <p className="text-sm opacity-90 mt-1">{notification.message}</p>
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="ml-2 opacity-60 hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
