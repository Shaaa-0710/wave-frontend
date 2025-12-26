// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/ui/Navbar';
import HomeRoute from './routes/HomeRoute';
import Login from './routes/Login';
import UserRegister from './routes/UserRegister';
import SeekerRegister from './routes/SeekerRegister';
import UserDashboard from './routes/UserDashboard';
import SeekerDashboard from './routes/SeekerDashboard';
import MapDashboard from './routes/MapDashboard';
import RegisterRoute from './routes/RegisterRoute'; // ✅ Import the RegisterRoute
import ProfilePage from './routes/ProfilePage';
import NotificationsPage from './routes/NotificationsPage';
function App() {
  return (
    <>
      <Routes>
        {/* ✅ Add these new routes */}
        <Route path="/" element={<HomeRoute />} />
        <Route path="/about" element={<HomeRoute />} /> {/* Scrolls to About section */}
        <Route path="/features" element={<HomeRoute />} /> {/* Scrolls to Features */}
        <Route path="/login" element={<Login />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/register" element={<RegisterRoute />} />
        <Route path="/profile/:userId" element={<ProfilePage />} />
        <Route path="/user/register" element={<UserRegister />} />
        <Route path="/seeker/register" element={<SeekerRegister />} />
        <Route path="/user/dashboard" element={<UserDashboard />} />
        <Route path="/seeker/dashboard" element={<SeekerDashboard />} />
        <Route path="/map" element={<MapDashboard />} />
      </Routes>
    </>
  );
}

export default App;