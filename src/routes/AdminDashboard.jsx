import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function AdminDashboard() {
    const { currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        if (!currentUser?.is_admin) return;
        api.get('/api/admin/users').then(res => setUsers(res.data));
        api.get('/api/admin/tasks').then(res => setTasks(res.data));
    }, [currentUser]);

    if (!currentUser?.is_admin) {
        return <h2 className="p-6 text-red-600">Access denied</h2>;
    }

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">👑 Admin Dashboard</h1>

            <h2 className="text-xl font-semibold mt-6">Users</h2>
            <div className="border p-4 rounded">
                {users.map(u => (
                    <div key={u.id} className="border-b py-2">
                        {u.username} | {u.email} | {u.role}
                    </div>
                ))}
            </div>

            <h2 className="text-xl font-semibold mt-6">Tasks</h2>
            <div className="border p-4 rounded">
                {tasks.map(t => (
                    <div key={t.id} className="border-b py-2">
                        {t.title} | {t.category} | {t.status}
                    </div>
                ))}
            </div>
        </div>
    );
}
