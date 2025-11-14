
import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Role, Status, Task, User } from '../types';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'created_at'> | Task) => void;
  taskToEdit?: Task | null;
  users?: User[];
}

const TaskForm: React.FC<TaskFormProps> = ({ isOpen, onClose, onSave, taskToEdit, users = [] }) => {
  const { user: currentUser } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Status>(Status.TO_DO);
  const [dueDate, setDueDate] = useState('');
  const [tags, setTags] = useState('');
  const [userId, setUserId] = useState<number | undefined>(currentUser?.id);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description);
      setStatus(taskToEdit.status);
      setDueDate(taskToEdit.due_date ? taskToEdit.due_date.split(' ')[0] : ''); 
      setTags(taskToEdit.tags || '');
      setUserId(taskToEdit.user_id);
    } else {
      setTitle('');
      setDescription('');
      setStatus(Status.TO_DO);
      setDueDate('');
      setTags('');
      setUserId(currentUser?.id);
    }
  }, [taskToEdit, isOpen, currentUser]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !userId) return;

    const taskData = {
      title,
      description,
      status,
      user_id: userId,
      due_date: dueDate || null,
      tags: tags || null,
    };

    if (taskToEdit) {
      onSave({ ...taskToEdit, ...taskData });
    } else {
      onSave(taskData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">{taskToEdit ? 'Edit Task' : 'Create Task'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-800 dark:text-gray-200"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-800 dark:text-gray-200"
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
                <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Due Date</label>
                <input
                    type="date"
                    id="due_date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-800 dark:text-gray-200"
                />
            </div>
            <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md text-gray-800 dark:text-gray-200"
                >
                {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
          </div>
           <div className="mb-4">
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tags (comma-separated)</label>
                <input
                    type="text"
                    id="tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="e.g. urgent, frontend, bug"
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-800 dark:text-gray-200"
                />
            </div>

          {currentUser?.role === Role.ADMIN && users.length > 0 && (
            <div className="mb-4">
                <label htmlFor="user" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Assign To</label>
                <select
                id="user"
                value={userId}
                onChange={(e) => setUserId(Number(e.target.value))}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md text-gray-800 dark:text-gray-200"
                >
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
            </div>
          )}

          <div className="flex justify-end space-x-2 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Save Task</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
