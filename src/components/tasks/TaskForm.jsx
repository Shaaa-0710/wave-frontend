// src/components/tasks/TaskForm.jsx
import { useState } from 'react';
import api from '../../services/api';
import ErrorCard from '../ui/ErrorCard';
import "./TaskForm.css"

export default function TaskForm({ onTaskCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [reward, setReward] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lng)) {
      setError("Please enter valid latitude and longitude");
      return;
    }

    try {
      // Step 1: Create task
      const taskRes = await api.post('/api/tasks', {
        title,
        description,
        category,
        latitude: lat,
        longitude: lng,
        reward: reward || '',
      });

      // Step 2: Upload image if provided
      if (image) {
        const formData = new FormData();
        formData.append('image', image);
        await api.post(`/api/tasks/${taskRes.data.id}/image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      onTaskCreated(taskRes.data);

      // Reset form
      setTitle('');
      setDescription('');
      setCategory('');
      setLatitude('');
      setLongitude('');
      setReward('');
      setImage(null);
      setPreview(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create task. Please try again.');
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLatitude(latitude.toString());
        setLongitude(longitude.toString());
      },
      (error) => {
        let message = "Unable to access your location.";
        if (error.code === 1) {
          message = "Location access denied. Please allow location permissions.";
        }
        alert(message);
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="border p-4 rounded mb-6 bg-gray-50">
      <h3 className="text-lg font-semibold mb-3">Post a New Task</h3>
      {error && <ErrorCard message={error} />}
      
      <input
        type="text"
        placeholder="Task Title"
        className="w-full p-2 mb-3 border rounded"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <textarea
        placeholder="Description"
        className="w-full p-2 mb-3 border rounded"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows="2"
        required
      />
      <input
        type="text"
        placeholder="Category (e.g.,plumber,electrician)"
        className="w-full p-2 mb-3 border rounded"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        required
      />
      
      {/* Latitude & Longitude Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <input
          type="number"
          step="any"
          placeholder="Latitude"
          className="p-2 border rounded"
          value={latitude}
          onChange={(e) => setLatitude(e.target.value)}
          required
        />
        <input
          type="number"
          step="any"
          placeholder="Longitude"
          className="p-2 border rounded"
          value={longitude}
          onChange={(e) => setLongitude(e.target.value)}
          required
        />
      </div>

      <button
        type="button"
        onClick={useCurrentLocation}
        className="text-blue-600 text-sm mb-3 hover:underline"
      >
        📍 Use My Current Location
      </button>

      <input
        type="text"
        placeholder="Reward (e.g., Coffee, $5)"
        className="w-full p-2 mb-3 border rounded"
        value={reward}
        onChange={(e) => setReward(e.target.value)}
      />

      {/* Image Upload */}
      <div className="mb-3">
        <label className="block text-sm mb-1">Task Image (Optional)</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full p-2 border rounded"
        />
        {preview && (
          <img src={preview} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded" />
        )}
      </div>
      
      <button
        type="submit"
        className="w-full bg-green-500 hover:bg-green-600 text-white p-2 rounded font-medium transition"
      >
        Post Task
      </button>
    </form>
  );
}