// src/routes/SeekerDashboard.jsx
import './SeekerDashboard.css';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import TaskForm from '../components/tasks/TaskForm';
import TaskList from '../components/tasks/TaskList';
import Loading from '../components/ui/Loading';

export default function SeekerDashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const fetchMyTasks = async () => {
      try {
        const res = await api.get('/api/tasks/mine');
        setMyTasks(res.data);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('wave_token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMyTasks();
  }, [currentUser, navigate]);

  const handleTaskCreated = (newTask) => {
    setMyTasks(prev => [newTask, ...prev]);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) return <Loading />;

  const profilePic = currentUser?.image_url
    ? `http://localhost:5000${currentUser.image_url}`
    : null;

  return (
    <div className="dashboard-wrapper">

      {/* ===== WHITE NAVBAR ===== */}
      <nav className="dashboard-navbar light">
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

          <button
            onClick={handleLogout}
            className="logout-btn"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* ===== CONTENT ===== */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Seeker Dashboard
          </h1>
        </div>

        <section className="bg-white p-4 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Post a New Task
          </h2>
          <TaskForm onTaskCreated={handleTaskCreated} />
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            My Posted Tasks
          </h2>
          {myTasks.length === 0 ? (
            <p className="text-gray-500 italic">
              You haven’t posted any tasks yet.
            </p>
          ) : (
            <TaskList tasks={myTasks} />
          )}
        </section>

      </div>
    </div>
  );
}
