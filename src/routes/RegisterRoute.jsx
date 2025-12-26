// src/routes/RegisterRoute.jsx
import { Link } from 'react-router-dom';
import './RegisterRoute.css';

export default function RegisterRoute() {
  return (
    <div className="max-w-2xl mx-auto p-6 text-center">
      <h1 className="text-3xl font-bold mb-6">Join Wave</h1>
      <p className="mb-8">Choose how you'd like to get started</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border p-6 rounded">
          <h2 className="text-xl font-semibold mb-3">I need help</h2>
          <p className="mb-4">Post tasks and get assistance from helpers nearby.</p>
          <Link
            to="/seeker/register"
            className="bg-green-500 text-white px-4 py-6 rounded inline-block"
          >
            Register as Seeker
          </Link>
        </div>
        <div className="border p-6 rounded">
          <h2 className="text-xl font-semibold mb-3">I want to help</h2>
          <p className="mb-4">Use your skills to assist others and earn rewards.</p>
          <Link
            to="/user/register"
            className="bg-blue-500 text-white px-4 py-2 rounded inline-block"
          >
            Register as user
          </Link>
        </div>
      </div>
    </div>
  );
}