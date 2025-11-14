import React from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { AdminDashboard, Dashboard, Login, Profile, Register, TaskDetail } from './pages';
import { Role } from './types';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route 
            path="/" 
            element={
              <ProtectedRoute allowedRoles={[Role.USER, Role.ADMIN]}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route 
              path="dashboard" 
              element={
                <ProtectedRoute allowedRoles={[Role.USER, Role.ADMIN]}>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="task/:taskId"
              element={
                <ProtectedRoute allowedRoles={[Role.USER, Role.ADMIN]}>
                  <TaskDetail />
                </ProtectedRoute>
              }
            />
            <Route 
              path="profile"
              element={
                <ProtectedRoute allowedRoles={[Role.USER, Role.ADMIN]}>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route 
              path="admin" 
              element={
                <ProtectedRoute allowedRoles={[Role.ADMIN]}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
          </Route>
          
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;