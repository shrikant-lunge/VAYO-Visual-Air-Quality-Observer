import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import ProfileSetup from './pages/ProfileSetup';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Predict from './pages/Predict';
import Routing from './pages/Routing';
import Policy from './pages/Policy';
import SafeZones from './pages/SafeZones';
import Compare from './pages/Compare';
import Community from './pages/Community';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminProtectedRoute from './components/AdminProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Landing />} />
          <Route path="/" element={<Landing />} />

          {/* Auth Protected Routes */}
          <Route path="/profile-setup" element={<ProtectedRoute element={<ProfileSetup />} />} />

          {/* Protected Dashboard & App Routes */}
          <Route
            path="/dashboard"
            element={<ProtectedRoute element={<Layout />} requireProfileComplete={true} />}
          >
            <Route index element={<Dashboard />} />
            <Route path="forecast" element={<Predict />} />
            <Route path="routing" element={<Routing />} />
            <Route path="policy" element={<Policy />} />
            <Route path="safe-zones" element={<SafeZones />} />
            <Route path="compare" element={<Compare />} />
            <Route path="community" element={<Community />} />
          </Route>

          {/* Catch all - redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />

          {/* Admin Routes */}
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
