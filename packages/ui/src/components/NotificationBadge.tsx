import { useState, useEffect } from 'react';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: number;
}

export function NotificationBadge() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => n.timestamp > Date.now() - 86400000).length;

  useEffect(() => {
    const handleNotification = (event: CustomEvent<Notification>) => {
      setNotifications(prev => [event.detail, ...prev].slice(0, 20));
    };
    
    window.addEventListener('app:notification' as any, handleNotification);
    return () => window.removeEventListener('app:notification' as any, handleNotification);
  }, []);

  const clearNotifications = () => {
    setNotifications([]);
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-blue-600';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-icon relative"
        aria-label="Notifications"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-3 w-3 text-[10px] bg-red-500 text-white rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-64 bg-white rounded border border-gray-300 shadow-lg z-50">
          <div className="px-3 py-2 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Notifications</h3>
              {notifications.length > 0 && (
                <button
                  onClick={clearNotifications}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          
          <div className="max-h-72 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <div key={notification.id} className="px-3 py-2 border-b border-gray-100 hover:bg-gray-50">
                  <p className={`text-xs ${getIconColor(notification.type)}`}>
                    {notification.message}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-1">
                    {new Date(notification.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-3 text-center text-gray-500 text-xs">
                No notifications
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function sendNotification(type: 'info' | 'success' | 'warning' | 'error', message: string) {
  const notification: Notification = {
    id: Math.random().toString(36),
    type,
    message,
    timestamp: Date.now(),
  };
  
  window.dispatchEvent(new CustomEvent('app:notification', { detail: notification }));
}
