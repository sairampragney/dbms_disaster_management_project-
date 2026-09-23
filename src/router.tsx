import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';

const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
    <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
    <p className="text-sm text-slate-600 max-w-lg mx-auto">
      This page foundation is configured. Full interactive workflow features will be implemented in upcoming phases.
    </p>
    <Link
      to="/"
      className="inline-block bg-sky-600 text-white font-medium text-xs px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors"
    >
      Return to Home
    </Link>
  </div>
);

export const AppRouter: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="about" element={<PlaceholderPage title="About Platform" />} />
            <Route path="alerts" element={<PlaceholderPage title="Public Disaster Alerts" />} />
            <Route path="safe-locations" element={<PlaceholderPage title="Safe Locations & Shelters" />} />
            <Route path="emergency" element={<PlaceholderPage title="Emergency Assistance Hub" />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />

            {/* Authenticated Protected Routes */}
            <Route
              path="dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="my-incidents"
              element={
                <ProtectedRoute>
                  <PlaceholderPage title="My Incident Reports" />
                </ProtectedRoute>
              }
            />
            <Route
              path="my-requests"
              element={
                <ProtectedRoute>
                  <PlaceholderPage title="My Emergency Requests" />
                </ProtectedRoute>
              }
            />
            <Route
              path="notifications"
              element={
                <ProtectedRoute>
                  <PlaceholderPage title="In-App Notifications" />
                </ProtectedRoute>
              }
            />
            <Route
              path="volunteer"
              element={
                <ProtectedRoute>
                  <PlaceholderPage title="Volunteer Portal" />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/*"
              element={
                <ProtectedRoute>
                  <PlaceholderPage title="Admin Control Center" />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<PlaceholderPage title="Page Not Found (404)" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};
