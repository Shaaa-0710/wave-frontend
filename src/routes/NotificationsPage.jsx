// src/routes/NotificationsPage.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function NotificationsPage() {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.id) return;

    const fetchNotifications = async () => {
      try {
        const res = await api.get('/api/notifications');
        setNotifications(res.data);
      } catch (err) {
        console.error("Failed to load notifications:", err);
        if (err.response?.status === 401) {
          localStorage.removeItem('wave_token');
          window.location.href = '/login';
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [currentUser?.id]);

  const markAsRead = async (id) => {
    try {
      await api.post(`/api/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(n => 
          n.id === id ? { ...n, is_read: true } : n
        )
      );
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  if (loading) return <div className="p-6">Loading notifications...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      
      {notifications.length === 0 ? (
        <p className="text-gray-500">No notifications yet</p>
      ) : (
        <div className="space-y-3">
          {notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`p-4 rounded-lg border ${
                notification.is_read 
                  ? 'bg-gray-50 border-gray-200' 
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              <p className="font-medium">{notification.message}</p>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(notification.created_at).toLocaleString()}
              </p>
              {!notification.is_read && (
                <button
                  onClick={() => markAsRead(notification.id)}
                  className="mt-2 text-sm bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                >
                  Mark as Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}