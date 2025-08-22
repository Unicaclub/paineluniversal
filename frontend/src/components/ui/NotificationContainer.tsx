import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import type { Notification } from '../../types';
import { Button } from './button';

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useUIStore();

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getColorClasses = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'border-green-500/20 bg-green-500/10 text-green-300';
      case 'error':
        return 'border-red-500/20 bg-red-500/10 text-red-300';
      case 'warning':
        return 'border-yellow-500/20 bg-yellow-500/10 text-yellow-300';
      case 'info':
        return 'border-blue-500/20 bg-blue-500/10 text-blue-300';
      default:
        return 'border-blue-500/20 bg-blue-500/10 text-blue-300';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300, scale: 0.3 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.5, transition: { duration: 0.2 } }}
            className={`
              relative p-4 rounded-lg border backdrop-blur-sm shadow-lg
              ${getColorClasses(notification.type)}
            `}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {getIcon(notification.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-foreground">
                  {notification.title}
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {notification.message}
                </p>
                
                {notification.actions && notification.actions.length > 0 && (
                  <div className="flex gap-2 mt-3">
                    {notification.actions.map((action, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          action.onClick();
                          removeNotification(notification.id);
                        }}
                        className="h-8 px-3 text-xs"
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeNotification(notification.id)}
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationContainer;
