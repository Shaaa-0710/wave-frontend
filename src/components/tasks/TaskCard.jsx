// src/components/tasks/TaskCard.jsx
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import "./TaskCard.css";

export default function TaskCard({ task, onDelete }) {
  const { currentUser } = useAuth();
  const [status, setStatus] = useState(task.status);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [mobile, setMobile] = useState('');
  const [charges, setCharges] = useState('');
  const [hours, setHours] = useState('');
  const [error, setError] = useState('');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingComment, setRatingComment] = useState('');

  const isPoster = currentUser && task.poster_id === currentUser.id;
  const isHelper = currentUser && task.helper_id === currentUser.id;

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
    try {
      const res = await api.post(`/api/tasks/${task.id}/quote`, {
        mobile,
        charges: chargesNum,
        hours: hoursNum
      });
      setStatus('quoted');
      setShowQuoteModal(false);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit quote");
    }
  };

  const handleAcceptQuote = async (quoteId) => {
    try {
      await api.post(`/api/quotes/${quoteId}/accept`);
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to accept quote");
    }
  };

  const handleComplete = async () => {
    if (!isPoster) return;
    try {
      const res = await api.post(`/api/tasks/${task.id}/complete`);
      setStatus(res.data.status);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to complete task");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await api.delete(`/api/tasks/${task.id}`);
      if (onDelete) onDelete(task.id);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete task");
    }
  };

  const handleSubmitRating = async () => {
    try {
      await api.post('/api/rating', {
        task_id: task.id,
        ratee_id: task.helper_id,
        score: ratingScore,
        comment: ratingComment
      });
      alert("✅ Rating submitted!");
      setShowRatingModal(false);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to submit rating");
    }
  };

  return (
    <div className="border p-4 mb-4 rounded shadow">
      <h4 className="font-bold text-lg">📋 {task.title}</h4>
      
      {/* ✅ Fixed Task Image */}
      {task.image_url && (
        <div className="task-image-container">
          <img src={`${process.env.REACT_APP_API_BASE_URL}${task.image_url}`} alt="Task" />
        </div>
      )}
      
      <p className="mt-2">{task.description || 'No description'}</p>
      <p>📍 Lat: {task.latitude}, Lng: {task.longitude}</p>
      <p>🎁 Reward: {task.reward}</p>
      
      {task.quotes && task.quotes.length > 0 && (
        <div className="mt-3">
          <h4 className="font-medium mb-2">Quotes Received ({task.quotes.length}):</h4>
          {task.quotes.map(quote => (
            <div key={quote.id} className="border p-2 rounded mt-2 bg-gray-50">
              <p><strong>Helper:</strong> {quote.helper_name}</p>
              <p><strong>Quote:</strong> ${quote.charges} for {quote.hours} hours</p>
              <p><strong>Mobile:</strong> {quote.mobile}</p>
              
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {quote.status === 'pending' && isPoster && task.status === 'open' && (
                  <button 
                    onClick={() => handleAcceptQuote(quote.id)}
                    className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Accept
                  </button>
                )}
                
                {quote.helper_id && (
                  <Link
                    to={`/profile/${quote.helper_id}`}
                    className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                  >
                    👤 Inspect Profile
                  </Link>
                )}
              </div>
              
              {quote.status === 'accepted' && (
                <p className="text-green-600 font-bold mt-2">✅ Quote Accepted</p>
              )}
            </div>
          ))}
        </div>
      )}

      {task.status === 'accepted' && (
        <p className="text-sm text-green-600 mt-2">
          💰 Accepted Quote: ${task.charges} for {task.hours} hour(s)
        </p>
      )}

      <p className="mt-2"><strong>Status:</strong> {status}</p>

      {status === 'open' && !isPoster && (
        <button
          onClick={() => setShowQuoteModal(true)}
          className="mt-2 bg-blue-500 text-white px-3 py-1 rounded"
        >
          Submit Quote
        </button>
      )}

      {status === 'accepted' && isPoster && (
        <button
          onClick={handleComplete}
          className="mt-2 bg-green-500 text-white px-3 py-1 rounded"
        >
          Mark as Completed
        </button>
      )}

      {isPoster && status === 'open' && (
        <button
          onClick={handleDelete}
          className="mt-2 bg-red-500 text-white px-3 py-1 rounded"
        >
          Delete Task
        </button>
      )}

      {status === 'completed' && isPoster && (
        <>
          <p className="mt-2 text-green-600 font-medium">✅ Task Completed</p>
          {!task.ratings?.some(r => r.rater_id === currentUser?.id && r.ratee_id === task.helper_id) && task.helper_id && (
            <div className="mt-2">
              <button
                onClick={() => setShowRatingModal(true)}
                className="bg-yellow-500 text-white px-3 py-1 rounded text-sm"
              >
                Rate Helper
              </button>
            </div>
          )}
        </>
      )}

      {showQuoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-3">Submit Quote</h3>
            <p className="text-sm mb-3">Provide your quote to help with this task.</p>
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            <input
              type="tel"
              placeholder="Your mobile number"
              className="w-full p-2 border rounded mb-3"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              autoFocus
            />
            <input
              type="number"
              step="0.01"
              placeholder="Charges (e.g., 50.00)"
              className="w-full p-2 border rounded mb-3"
              value={charges}
              onChange={(e) => setCharges(e.target.value)}
            />
            <input
              type="number"
              step="0.1"
              placeholder="Estimated hours (e.g., 2.5)"
              className="w-full p-2 border rounded mb-4"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
            />
            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <button
                onClick={() => setShowQuoteModal(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitQuote}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Submit Quote
              </button>
            </div>
          </div>
        </div>
      )}

      {showRatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-3">Rate Helper</h3>
            <div className="mb-3">
              <label className="block mb-1">Score (1-5)</label>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatingScore(star)}
                    className={`text-2xl ${ratingScore >= star ? 'text-yellow-500' : 'text-gray-300'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <textarea
              placeholder="Add a comment (optional)"
              className="w-full p-2 border rounded mb-4"
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              rows="3"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowRatingModal(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRating}
                className="px-4 py-2 bg-yellow-500 text-white rounded"
              >
                Submit Rating
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}