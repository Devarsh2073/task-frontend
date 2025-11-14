
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Role } from '../types';
import HomeIcon from './icons/HomeIcon';
import ProfileIcon from './icons/ProfileIcon';
import TasksIcon from './icons/TasksIcon';
import UsersIcon from './icons/UsersIcon';

interface SidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { user } = useAuth();

  const baseLinkClasses = "flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200";
  const activeLinkClasses = "bg-gray-700 text-white";

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black opacity-50 z-20 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      <div className={`fixed inset-y-0 left-0 w-64 bg-gray-800 dark:bg-gray-900 z-30 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition-transform duration-200 ease-in-out`}>
        <div className="flex items-center justify-center mt-8">
            <div className="flex items-center">
                <TasksIcon className="w-8 h-8 text-white"/>
                <span className="text-white text-2xl mx-2 font-semibold">Task Manager</span>
            </div>
        </div>
        <nav className="mt-10">
            <NavLink to="/dashboard" className={({ isActive }) => `${baseLinkClasses} ${isActive ? activeLinkClasses : ''}`}>
                <HomeIcon/>
                <span className="mx-4">Dashboard</span>
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => `${baseLinkClasses} ${isActive ? activeLinkClasses : ''}`}>
                <ProfileIcon/>
                <span className="mx-4">Profile</span>
            </NavLink>
            {user?.role === Role.ADMIN && (
                <NavLink to="/admin" className={({ isActive }) => `${baseLinkClasses} ${isActive ? activeLinkClasses : ''}`}>
                    <UsersIcon/>
                    <span className="mx-4">Admin Panel</span>
                </NavLink>
            )}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;