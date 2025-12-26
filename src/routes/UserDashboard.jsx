// src/routes/UserDashboard.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import TaskList from '../components/tasks/TaskList';
import './UserDashboard.css';

export default function UserDashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const fetchTasks = async () => {
      try {
        const res = await api.get('/api/tasks');
        const filtered = res.data.filter(task =>
          task.category === currentUser.work_platform &&
          !task.quotes?.some(q => q.helper_id === currentUser.id)
        );
        setTasks(filtered);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('wave_token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [currentUser, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const profilePic = currentUser?.image_url
    ? `http://localhost:5000${currentUser.image_url}`
    : null;

  return (
    <div className="dashboard-wrapper">
      {/* NAVBAR */}
      <nav className="dashboard-navbar">
        <div className="logo">🌊 WAVE</div>

        <div className="nav-right">
          <Link to={`/profile/${currentUser?.id}`}>
            {profilePic ? (
              <img
                src={profilePic}
                alt="Profile"
                className="nav-profile-pic-small"
              />
            ) : (
              <div className="nav-profile-placeholder">
                {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
          </Link>

          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </nav>

      {/* CONTENT */}
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Helper Dashboard</h1>
          <Link to="/map" className="btn-primary">🗺️ Live Map</Link>
        </div>

        <h2 className="section-title">Available Tasks</h2>

        {loading ? (
          <p className="loading-text">Loading tasks...</p>
        ) : (
          <TaskList tasks={tasks} />
        )}
      </div>
    </div>
  );
}
