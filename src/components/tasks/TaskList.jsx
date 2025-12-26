// src/components/tasks/TaskList.jsx
import TaskCard from './TaskCard';
import "./TaskList.css"

export default function TaskList({ tasks = [], onDelete }) {
  if (tasks.length === 0) {
    return <p className="text-gray-500">No tasks available.</p>;
  }

  return (
    <div>
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}