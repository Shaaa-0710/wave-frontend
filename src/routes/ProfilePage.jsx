// src/routes/ProfilePage.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Loading from '../components/ui/Loading';
import './Profilepage.css';

export default function ProfilePage() {
  const { userId } = useParams();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileRes = await api.get(`/api/profile/${userId}`);
        setProfile(profileRes.data);
        const tasksRes = await api.get(`/api/tasks/completed/${userId}`);
        setCompletedTasks(tasksRes.data);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('wave_token');
          logout();
          navigate('/login');
        } else if (err.response?.status === 404) {
          setError("Profile not found");
        } else {
          setError("Failed to load profile");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId, navigate, logout]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.match('image.*')) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploading(true);
      const res = await api.post('/api/profile/upload', formData);
      setProfile(prev => ({
        ...prev,
        user: { ...prev.user, image_url: res.data.image_url }
      }));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const isOwnProfile = currentUser?.id === profile?.user.id;

  if (loading) return <Loading />;
  if (error) return <div className="error-text">{error}</div>;
  if (!profile) return null;

  return (
    <div className="profile-wrapper">

      {/* ===== INSTAGRAM STYLE HEADER ===== */}
      <div className="profile-header">
        <div className="profile-avatar">
          {profile.user.image_url ? (
            <img src={`http://localhost:5000${profile.user.image_url}`} alt="Profile" />
          ) : (
            <div className="avatar-placeholder">
              {profile.user.name?.charAt(0)?.toUpperCase()}
            </div>
          )}

          {isOwnProfile && (
            <>
              <button
                className="edit-avatar"
                onClick={() => fileInputRef.current?.click()}
              >
                ✏️
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                hidden
              />
            </>
          )}
        </div>

        <div className="profile-info">
          <div className="username-row">
            <h2>{profile.user.name}</h2>
            <span className="settings-icon">⚙️</span>
          </div>

          <div className="profile-stats">
            <div>
              <strong>{profile.completed_tasks_as_helper}</strong>
              <span>Helper</span>
            </div>
            <div>
              <strong>{profile.completed_tasks_as_seeker}</strong>
              <span>Seeker</span>
            </div>
            <div>
              <strong>{profile.total_ratings}</strong>
              <span>Ratings</span>
            </div>
          </div>

          <p className="profile-email">{profile.user.email}</p>
        </div>
      </div>

      {/* ===== COMPLETED TASKS ===== */}
      <section className="profile-section">
        <h3>Completed Tasks as Helper</h3>
        {completedTasks.length === 0 ? (
          <p className="muted">No completed tasks yet</p>
        ) : (
          completedTasks.map(task => (
            <div key={task.id} className="task-card">
              <h4>{task.title}</h4>
              <span>{task.category}</span>
            </div>
          ))
        )}
      </section>

      {/* ===== RATINGS ===== */}
      <section className="profile-section">
        <h3>Received Ratings</h3>
        {profile.ratings.length === 0 ? (
          <p className="muted">No ratings yet</p>
        ) : (
          profile.ratings.map(rating => (
            <div key={rating.id} className="rating-card">
              <strong>{rating.rater_name}</strong>
              <span>★ {rating.score}</span>
              {rating.comment && <p>{rating.comment}</p>}
            </div>
          ))
        )}
      </section>

    </div>
  );
}
