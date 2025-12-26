// src/routes/Login.jsx
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ErrorCard from '../components/ui/ErrorCard';
import './Login.css';
 
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await login(email, password);
      if (user.role === 'seeker') {
        navigate('/seeker/dashboard');
      } else if (user.role === 'user') {
        navigate('/user/dashboard');
      } else {
        setError('Unknown role. Please contact support.');
      }
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        {/* Tab Header */}
        <div className="flex mb-6">
          <button
            className="flex-1 py-2 px-4 text-center bg-indigo-600 text-white rounded-l-md font-medium"
            disabled
          >
            Login
          </button>
          <button
            className="flex-1 py-6 px-8 text-center bg-gray-100 text-gray-700 rounded-r-md font-medium hover:bg-gray-200 transition"
            onClick={() => navigate('/register')}
          >
            Register
          </button>
        </div>

        {/* Error Message */}
        {error && <ErrorCard message={error} />}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full p-3 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {/* Optional: Add password visibility toggle later */}
              {/* <button type="button" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                Show
              </button> */}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-md font-medium transition-colors"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}