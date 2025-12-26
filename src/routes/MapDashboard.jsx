// src/routes/MapDashboard.jsx
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Loading from '../components/ui/Loading';

// Fix Leaflet marker icons (remove trailing spaces!)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function MapDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [map, setMap] = useState(null);
  const [radius, setRadius] = useState(5); // km
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [submittingQuote, setSubmittingQuote] = useState(false);
  const [quoteTaskId, setQuoteTaskId] = useState(null);
  const [mobile, setMobile] = useState('');
  const [charges, setCharges] = useState('');
  const [hours, setHours] = useState('');
  const [error, setError] = useState('');
  const userMarkerRef = useRef(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  // Initialize map
  useEffect(() => {
    if (!currentUser?.latitude || !currentUser?.longitude) return;

    const leafletMap = L.map('map', {
      // ✅ Mobile-friendly options
      zoomControl: window.innerWidth > 768, // Show zoom controls on desktop only
      tap: true, // Enable touch interactions
      touchZoom: true,
      doubleClickZoom: true,
      scrollWheelZoom: window.innerWidth > 768, // Disable on mobile to prevent accidental zoom
    }).setView([currentUser.latitude, currentUser.longitude], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(leafletMap);

    const userMarker = L.marker([currentUser.latitude, currentUser.longitude])
      .addTo(leafletMap)
      .bindPopup("You are here")
      .openPopup();
    userMarkerRef.current = userMarker;
    setMap(leafletMap);

    return () => {
      if (leafletMap) leafletMap.remove();
    };
  }, [currentUser]);

  // Fetch open tasks within radius AND matching work_platform
  useEffect(() => {
    if (!map || !currentUser) return;

    const fetchTasks = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/map/tasks?radius=${radius}`);
        // Filter tasks: only show if task.category matches user's work_platform
        const filteredTasks = res.data.filter(task => 
          task.category === currentUser.work_platform
        );
        setTasks(filteredTasks);
      } catch (err) {
        console.error("Failed to load map tasks:", err);
        if (err.response?.status === 401) {
          localStorage.removeItem('wave_token');
          navigate('/login');
        } else {
          alert("Failed to load tasks. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [map, radius, currentUser, navigate]);

  // Update markers when tasks change
  useEffect(() => {
    if (!map) return;

    // Clear all task markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker && layer !== userMarkerRef.current) {
        map.removeLayer(layer);
      }
    });

    // Add task markers
    tasks.forEach(task => {
      const marker = L.marker([task.latitude, task.longitude])
        .addTo(map)
        .bindPopup(`
          <b>${task.title}</b><br/>
          Category: ${task.category}<br/>
          Reward: ${task.reward || 'N/A'}<br/>
          Distance: ${task.distance_km} km<br/>
          <button onclick="window.openQuoteModal(${task.id})"
                  style="margin-top: 8px; padding: 6px 10px; background: #2196f3; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; width: 100%;">
            Submit Quote
          </button>
        `);
    });
  }, [map, tasks]);

  // Expose quote modal globally for Leaflet popup
  useEffect(() => {
    window.openQuoteModal = (taskId) => {
      setQuoteTaskId(taskId);
      setError('');
      setMobile(currentUser?.mobile || '');
      setCharges('');
      setHours('');
    };
    return () => {
      delete window.openQuoteModal;
    };
  }, [currentUser]);

  const handleSubmitQuote = async () => {
    if (!mobile.trim()) {
      setError("Mobile number is required");
      return;
    }
    const chargesNum = parseFloat(charges);
    const hoursNum = parseFloat(hours);
    if (isNaN(chargesNum) || isNaN(hoursNum)) {
      setError("Please enter valid charges and hours");
      return;
    }
    if (chargesNum < 0 || hoursNum <= 0) {
      setError("Charges must be ≥ 0 and hours must be > 0");
      return;
    }

    setSubmittingQuote(true);
    try {
      await api.post(`/api/tasks/${quoteTaskId}/quote`, {
        mobile,
        charges: chargesNum,
        hours: hoursNum
      });
      alert("✅ Quote submitted successfully!");
      setQuoteTaskId(null);

      // Refresh task list
      const res = await api.get(`/api/map/tasks?radius=${radius}`);
      const filteredTasks = res.data.filter(task => 
        task.category === currentUser.work_platform
      );
      setTasks(filteredTasks);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit quote");
    } finally {
      setSubmittingQuote(false);
    }
  };

  const handleSetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await api.put('/profile/location', {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          });
          window.location.reload();
        } catch (err) {
          if (err.response?.status === 401) {
            localStorage.removeItem('wave_token');
            navigate('/login');
          } else {
            alert("Failed to update location");
          }
        }
      },
      () => alert("Location access denied")
    );
  };

  // Show location setup if not set
  if (currentUser && (!currentUser.latitude || !currentUser.longitude)) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl mb-4">📍 Set Your Location</h2>
        <p className="mb-4">Allow access to your location to see nearby tasks.</p>
        <button
          onClick={handleSetLocation}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Use My Current Location
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <h1 className="text-2xl font-bold">Live Task Map</h1>
        <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
          <div className="w-full md:w-auto">
            <label className="block text-sm font-medium mb-1">
              Search Radius: <span className="font-bold">{radius} km</span>
            </label>
            <input
              type="range"
              min="0.5"
              max="50"
              step="0.5"
              value={radius}
              onChange={(e) => setRadius(parseFloat(e.target.value))}
              className="w-full md:w-32"
            />
          </div>
          <button
            onClick={handleSetLocation}
            className="bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded text-sm w-full md:w-auto"
          >
            Update My Location
          </button>
        </div>
      </div>

      {loading && <Loading />}

      {/* Submit Quote Modal */}
      {quoteTaskId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-3">Submit Quote</h3>
            <p className="text-sm mb-3">
              Provide your quote to help with this task.
            </p>
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            <input
              type="tel"
              placeholder="Your mobile number"
              className="w-full p-3 border rounded mb-3 text-base"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              autoFocus
            />
            <input
              type="number"
              step="0.01"
              placeholder="Charges (e.g., 50.00)"
              className="w-full p-3 border rounded mb-3 text-base"
              value={charges}
              onChange={(e) => setCharges(e.target.value)}
            />
            <input
              type="number"
              step="0.1"
              placeholder="Estimated hours (e.g., 2.5)"
              className="w-full p-3 border rounded mb-4 text-base"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
            />
            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <button
                onClick={() => setQuoteTaskId(null)}
                className="px-4 py-2 border rounded text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitQuote}
                disabled={submittingQuote}
                className="px-4 py-2 bg-blue-500 text-white rounded text-base disabled:opacity-50"
              >
                {submittingQuote ? "Submitting..." : "Submit Quote"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile-friendly map container */}
      <div 
        id="map" 
        style={{ 
          height: window.innerWidth < 768 ? '60vh' : '75vh', 
          width: '100%', 
          borderRadius: '8px',
          zIndex: 0 // Ensure map doesn't block other elements
        }}
      ></div>
    </div>
  );
}