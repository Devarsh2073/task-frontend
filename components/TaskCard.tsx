
import React from 'react';
import { Task, Status } from '../types';
import EditIcon from './icons/EditIcon';
import DeleteIcon from './icons/DeleteIcon';
import { Link } from 'react-router-dom';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
}

const statusColors: { [key in Status]: string } = {
  [Status.TO_DO]: 'bg-gray-500',
  [Status.IN_PROGRESS]: 'bg-blue-500',
  [Status.COMPLETED]: 'bg-green-500',
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete }) => {
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== Status.COMPLETED;

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onEdit(task);
  };
  
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onDelete(task.id);
  };

  const tags = task.tags?.split(',').map(tag => tag.trim()).filter(Boolean) || [];

  return (
    <Link to={`/task/${task.id}`} className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex flex-col justify-between hover:shadow-lg transition-shadow duration-200 border-2 ${isOverdue ? 'border-red-500 dark:border-red-600' : 'border-transparent'}`}>
      <div>
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-lg mb-2 text-gray-800 dark:text-white">{task.title}</h3>
          <span className={`px-2 py-1 text-xs font-semibold text-white rounded-full ${statusColors[task.status]}`}>
            {task.status}
          </span>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">{task.description}</p>
        
        {task.due_date && (
            <p className={`text-xs mb-2 ${isOverdue ? 'text-red-500 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
                Due: {new Date(task.due_date).toLocaleDateString()}
            </p>
        )}

        {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
                {tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-full">{tag}</span>
                ))}
            </div>
        )}
        
        {task.user && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">
                Assigned to: <span className="font-semibold">{task.user.name}</span>
            </p>
        )}
      </div>
      <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Created: {new Date(task.created_at).toLocaleDateString()}
        </p>
        <div className="flex space-x-2">
          <button onClick={handleEditClick} className="p-1 text-gray-500 hover:text-blue-500 transition-colors duration-200 z-10">
            <EditIcon />
          </button>
          <button onClick={handleDeleteClick} className="p-1 text-gray-500 hover:text-red-500 transition-colors duration-200 z-10">
            <DeleteIcon />
          </button>
        </div>
      </div>
    </Link>
  );
};

export default TaskCard;
