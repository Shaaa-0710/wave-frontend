// src/components/ui/Navbar.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (currentUser?.id) {
      const fetchNotifications = async () => {
        try {
          const res = await api.get('/api/notifications');
          const unread = res.data.filter(n => !n.is_read);
          setUnreadCount(unread.length);
        } catch (err) {
          console.error("Failed to load notifications");
        }
      };
      fetchNotifications();

      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [currentUser?.id]);

  const handleLogout = () => {
    logout();
    navigate('/'); // Go back to home page after logout
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">🌊 WAVE</Link>
      
      <div className="navbar-actions">
        {currentUser ? (
          // ✅ Logged in: Show user greeting + notifications + logout
          <>
            <span className="user-name">
              Hi, {currentUser.name || currentUser.username || currentUser.email?.split('@')[0] || "User"}
            </span>
            
            <Link to="/notifications" className="relative mx-3">
              🔔
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {unreadCount}
                </span>
              )}
            </Link>
            
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </>
        ) : (
          // ❌ Not logged in: Show nothing (login/register are on HomeRoute)
          <span className="guest-text"></span>
        )}
      </div>
    </nav>
  );
}