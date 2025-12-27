// src/routes/ProfilePage.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Loading from '../components/ui/Loading';
import './ProfilePage.css';

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
        console.error("Failed to load profile:", err);
        if (err.response?.status === 401) {
          localStorage.removeItem('wave_token');
          logout();
          navigate('/login');
        } else if (err.response?.status === 404) {
          setError("Profile not found");
        } else {
          setError("Failed to load profile. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, navigate, logout]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      alert('Please upload an image file (JPEG, PNG, GIF)');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploading(true);
      const res = await api.post('/api/profile/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setProfile(prev => ({
        ...prev,
        user: { ...prev.user, image_url: res.data.image_url }
      }));
      alert("✅ Profile picture updated!");
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to upload image";
      alert(errorMsg);
      console.error("Upload error:", err.response?.data);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const isOwnProfile = currentUser?.id === profile?.user.id;

  if (loading) return <Loading />;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;
  if (!profile) return <div className="p-6 text-center">Profile not found</div>;

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            {profile.user.image_url ? (
              <img 
                src={`${process.env.REACT_APP_API_BASE_URL}${profile.user.image_url}`} 
                alt="Profile" 
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-3xl">
                {profile.user.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
            
            {isOwnProfile && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-indigo-600 text-white p-1.5 rounded-full hover:bg-indigo-700 transition"
                title="Change profile picture"
              >
                ✏️
              </button>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="text-center md:text-left">
            <h1 className="text-2xl font-bold">{profile.user.name}</h1>
            <p className="text-gray-600">{profile.user.email}</p>
            <p className="mt-1">
              <span className="font-medium">Role:</span> {profile.user.role}
            </p>
            {profile.user.work_platform && (
              <p>
                <span className="font-medium">Platform:</span> {profile.user.work_platform}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 text-center border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-700">Tasks as Helper</h3>
          <p className="text-2xl font-bold text-blue-600">{profile.completed_tasks_as_helper}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-700">Tasks as Seeker</h3>
          <p className="text-2xl font-bold text-green-600">{profile.completed_tasks_as_seeker}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-700">Avg. Rating</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {profile.average_rating > 0 ? (
              <>
                ★ {profile.average_rating.toFixed(1)} <span className="text-sm ml-1">({profile.total_ratings} ratings)</span>
              </>
            ) : (
              "No ratings"
            )}
          </p>
        </div>
      </div>

      {/* Completed Tasks Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6 border border-gray-100">
        <h2 className="text-xl font-semibold mb-4">Completed Tasks as Helper ({completedTasks.length})</h2>
        {completedTasks.length === 0 ? (
          <p className="text-gray-500">No completed tasks yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedTasks.map(task => (
              <div key={task.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                <h3 className="font-bold text-lg text-gray-900">{task.title}</h3>
                <p className="text-gray-600 text-sm mt-1">{task.category}</p>
                <div className="mt-2 space-y-1">
                  <p className="text-sm">
                    <span className="font-medium text-gray-700">Reward:</span> 
                    <span className="ml-1">{task.reward || 'N/A'}</span>
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-gray-700">Charges:</span> 
                    <span className="ml-1">${task.charges || 'N/A'} for {task.hours || 'N/A'}h</span>
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Completed on {new Date(task.updated_at || task.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rating History */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
        <h2 className="text-xl font-semibold mb-4">Received Ratings ({profile.ratings.length})</h2>
        {profile.ratings.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No ratings yet</p>
        ) : (
          <div className="space-y-4">
            {profile.ratings.map(rating => (
              <div key={rating.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">
                      From: <Link to={`/profile/${rating.rater_id}`} className="text-blue-600 hover:underline">
                        {rating.rater_name}
                      </Link>
                    </p>
                    <div className="flex items-center mt-1">
                      <span className="text-yellow-500 mr-1">★</span>
                      <span className="text-lg font-bold">{rating.score}</span>
                    </div>
                    {rating.task && (
                      <p className="text-sm text-gray-600 mt-2">
                        For task: <Link to={`/profile/${rating.ratee_id}`} className="text-blue-600 hover:underline">
                          "{rating.task.title}"
                        </Link>
                      </p>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(rating.created_at).toLocaleDateString()}
                  </p>
                </div>
                {rating.comment && (
                  <p className="mt-2 text-gray-700 italic bg-gray-50 p-2 rounded">
                    "{rating.comment}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}