import React, { useEffect, useState } from 'react';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import PlusIcon from '../components/icons/PlusIcon';
import { apiCreateTask, apiDeleteTask, apiFetchAllTasks, apiFetchAllUsers, apiUpdateTask } from '../services/api';
import { Status, Task, User } from '../types';

const AdminDashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<Status | 'All'>('All');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [allUsers, allTasks] = await Promise.all([
          apiFetchAllUsers(),
          apiFetchAllTasks({
              search: searchTerm || undefined,
              status: filter,
              sort_by: sortBy,
              sort_dir: sortDir,
          }),
      ]);
      setUsers(allUsers);
      
      const tasksWithFullUsers = allTasks.map(task => ({
          ...task,
          user: allUsers.find(u => u.id === task.user_id),
      }));
      setTasks(tasksWithFullUsers);

    } catch (error) {
      console.error("Failed to fetch admin data", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    const handler = setTimeout(() => {
        fetchData();
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm, filter, sortBy, sortDir]);

  const handleCreate = () => {
    setTaskToEdit(null);
    setIsFormOpen(true);
  };

  const handleEdit = (task: Task) => {
    setTaskToEdit(task);
    setIsFormOpen(true);
  };

  const handleDelete = async (taskId: number) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await apiDeleteTask(taskId);
        fetchData();
      } catch (error) {
        console.error("Failed to delete task", error);
      }
    }
  };

  const handleSave = async (taskData: Omit<Task, 'id' | 'created_at'> | Task) => {
    try {
      if ('id' in taskData) {
        const updatedTaskData = { ...taskData };
        delete updatedTaskData.user;
        await apiUpdateTask(updatedTaskData.id, updatedTaskData);
      } else {
        await apiCreateTask(taskData);
      }
      setIsFormOpen(false);
      setTaskToEdit(null);
      fetchData();
    } catch (error) {
      console.error("Failed to save task", error);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Admin Dashboard</h1>
        <button
          onClick={handleCreate}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900"
        >
          <PlusIcon />
          <span className="ml-2">Create Task</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="lg:col-span-2">
            <input
                type="search"
                placeholder="Search all tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as Status | 'All')}
          className="px-4 py-2 w-full rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="All">All Statuses</option>
          {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <div className="flex gap-2">
            <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 w-full rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
                <option value="created_at">Sort by Date</option>
                <option value="due_date">Sort by Due Date</option>
                <option value="title">Sort by Title</option>
            </select>
            <select
            value={sortDir}
            onChange={(e) => setSortDir(e.target.value as 'asc' | 'desc')}
            className="px-4 py-2 w-full rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
                <option value="desc">Desc</option>
                <option value="asc">Asc</option>
            </select>
        </div>
      </div>


      {isLoading ? (
        <p className="text-center text-gray-500 dark:text-gray-400">Loading data...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.length > 0 ? tasks.map(task => (
            <TaskCard key={task.id} task={task} onEdit={handleEdit} onDelete={handleDelete} />
          )) : (
            <p className="text-center text-gray-500 dark:text-gray-400 col-span-full py-8">No tasks found matching your criteria.</p>
          )}
        </div>
      )}

      <TaskForm
        isOpen={isFormOpen}
        onClose={() => {
            setIsFormOpen(false);
            setTaskToEdit(null);
        }}
        onSave={handleSave}
        taskToEdit={taskToEdit}
        users={users}
      />
    </>
  );
};

export default AdminDashboard;