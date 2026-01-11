import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function AdminDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (!currentUser) return;

    if (currentUser.email !== "wavecommunnity@gmail.com") {
      navigate('/login');
      return;
    }

    const loadAdminData = async () => {
      try {
        const usersRes = await api.get('/api/admin/users');
        const tasksRes = await api.get('/api/admin/tasks');
        setUsers(usersRes.data);
        setTasks(tasksRes.data);
      } catch (err) {
        console.error(err);
        alert("Admin access denied");
        navigate('/');
      }
    };

    loadAdminData();
  }, [currentUser, navigate]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">👑 Admin Dashboard</h1>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-2">All Users</h2>
        <div className="border rounded">
          {users.map(u => (
            <div key={u.id} className="p-2 border-b">
              {u.id} | {u.username} | {u.email} | {u.role}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">All Tasks</h2>
        <div className="border rounded">
          {tasks.map(t => (
            <div key={t.id} className="p-2 border-b">
              #{t.id} | {t.title} | {t.status}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
