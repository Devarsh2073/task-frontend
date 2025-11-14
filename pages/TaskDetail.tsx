import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TaskForm from '../components/TaskForm';
import DeleteIcon from '../components/icons/DeleteIcon';
import EditIcon from '../components/icons/EditIcon';
import { useAuth } from '../hooks/useAuth';
import { apiDeleteTask, apiFetchAllUsers, apiFetchTask, apiUpdateTask } from '../services/api';
import { Role, Status, Task, User } from '../types';


const statusColors: { [key in Status]: string } = {
  [Status.TO_DO]: 'bg-gray-500',
  [Status.IN_PROGRESS]: 'bg-blue-500',
  [Status.COMPLETED]: 'bg-green-500',
};

const TaskDetail: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);


  useEffect(() => {
    const fetchTaskDetails = async () => {
      if (taskId) {
        try {
          setLoading(true);
          const fetchedTask = await apiFetchTask(parseInt(taskId, 10));
          setTask(fetchedTask);

          if (user?.role === Role.ADMIN) {
            const allUsers = await apiFetchAllUsers();
            if (fetchedTask.user && !allUsers.find(u => u.id === fetchedTask.user_id)) {
              setUsers([...allUsers, fetchedTask.user as User]);
            } else {
              setUsers(allUsers);
            }
          }

        } catch (err) {
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError('An unknown error occurred.');
          }
        } finally {
          setLoading(false);
        }
      }
    };
    fetchTaskDetails();
  }, [taskId, user?.role]);

  const handleEdit = () => {
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (task && window.confirm('Are you sure you want to delete this task?')) {
        try {
            await apiDeleteTask(task.id);
            navigate('/dashboard');
        } catch (error) {
            setError('Failed to delete task. Please try again.');
            console.error(error);
        }
    }
  };

  const handleSave = async (taskData: Omit<Task, 'id' | 'created_at'> | Task) => {
    if ('id' in taskData) {
        try {
            const updatedTaskData = { ...taskData };
            delete updatedTaskData.user;
            const updatedTask = await apiUpdateTask(taskData.id, updatedTaskData);
            
            if (user?.role === Role.ADMIN) {
                updatedTask.user = users.find(u => u.id === updatedTask.user_id);
            } else {
                updatedTask.user = task?.user;
            }

            setTask(updatedTask);
            setIsFormOpen(false);
        } catch (error) {
            console.error("Failed to update task", error);
            setError("Failed to update task. Please check the details and try again.");
        }
    }
  };
  
  const tags = task?.tags?.split(',').map(tag => tag.trim()).filter(Boolean) || [];
  
  if (loading) return <p className="text-center mt-8 text-gray-500 dark:text-gray-400">Loading task details...</p>;
  if (!task) return <p className="text-center mt-8 text-gray-500 dark:text-gray-400">Task not found.</p>;

  return (
    <>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8 max-w-4xl mx-auto">
            {error && <p className="text-center mb-4 text-red-500">Error: {error}</p>}

            <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">{task.title}</h1>
                <span className={`flex-shrink-0 px-3 py-1 text-sm font-semibold text-white rounded-full ${statusColors[task.status]}`}>
                    {task.status}
                </span>
            </div>
            
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap gap-x-6 gap-y-2">
                <span><strong>Created:</strong> {new Date(task.created_at).toLocaleString()}</span>
                {task.due_date && <span><strong>Due Date:</strong> {new Date(task.due_date).toLocaleDateString()}</span>}
                {task.user && <span><strong>Assigned to:</strong> <span className="font-semibold">{task.user.name}</span></span>}
            </div>

            {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                    <strong>Tags:</strong>
                    {tags.map(tag => (
                        <span key={tag} className="px-2 py-1 text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full">{tag}</span>
                    ))}
                </div>
            )}

            <div className="prose prose-sm dark:prose-invert max-w-none mt-6">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Description</h2>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{task.description || 'No description provided.'}</p>
            </div>
            
            <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="w-full sm:w-auto px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                    Back
                </button>
                <div className="flex space-x-2">
                    <button
                        onClick={handleEdit}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        <EditIcon className="mr-2" />
                        Edit
                    </button>
                    <button
                        onClick={handleDelete}
                        className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                        <DeleteIcon className="mr-2" />
                        Delete
                    </button>
                </div>
            </div>
        </div>

        {task && <TaskForm
            isOpen={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            onSave={handleSave}
            taskToEdit={task}
            users={users}
        />}
    </>
  );
};

export default TaskDetail;