import React, { useEffect, useState } from 'react';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import PlusIcon from '../components/icons/PlusIcon';
import { apiCreateTask, apiDeleteTask, apiFetchUserTasks, apiUpdateTask } from '../services/api';
import { Status, Task } from '../types';

const Dashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [filter, setFilter] = useState<Status | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');


  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const userTasks = await apiFetchUserTasks({
          search: searchTerm || undefined,
          status: filter,
          sort_by: sortBy,
          sort_dir: sortDir
      });
      setTasks(userTasks);
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    const handler = setTimeout(() => {
        fetchTasks();
    }, 500);

    return () => {
        clearTimeout(handler);
    };
  }, [filter, sortBy, sortDir, searchTerm]);

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
        setTasks(tasks.filter(t => t.id !== taskId));
      } catch (error) {
        console.error("Failed to delete task", error);
      }
    }
  };

  const handleSave = async (taskData: Omit<Task, 'id' | 'created_at'> | Task) => {
    try {
        if ('id' in taskData) {
            await apiUpdateTask(taskData.id, taskData);
        } else {
            await apiCreateTask(taskData);
        }
        setIsFormOpen(false);
        setTaskToEdit(null);
        fetchTasks();
    } catch (error) {
        console.error("Failed to save task", error);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Your Tasks</h1>
        <button
          onClick={handleCreate}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900"
        >
          <PlusIcon />
          <span className="ml-2">Add Task</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="relative lg:col-span-2">
            <input
                type="search"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
            </div>
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
        <p className="text-center text-gray-500 dark:text-gray-400">Loading tasks...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.length > 0 ? (
            tasks.map(task => (
              <TaskCard key={task.id} task={task} onEdit={handleEdit} onDelete={handleDelete} />
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400 col-span-full text-center py-8">No tasks found.</p>
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
      />
    </>
  );
};

export default Dashboard;