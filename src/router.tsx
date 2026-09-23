import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { HomePage } from './pages/HomePage';

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
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<PlaceholderPage title="About Platform" />} />
          <Route path="alerts" element={<PlaceholderPage title="Public Disaster Alerts" />} />
          <Route path="safe-locations" element={<PlaceholderPage title="Safe Locations & Shelters" />} />
          <Route path="emergency" element={<PlaceholderPage title="Emergency Assistance Hub" />} />
          <Route path="login" element={<PlaceholderPage title="Login" />} />
          <Route path="register" element={<PlaceholderPage title="Register Citizen Account" />} />
          <Route path="dashboard" element={<PlaceholderPage title="Citizen Dashboard" />} />
          <Route path="my-incidents" element={<PlaceholderPage title="My Incident Reports" />} />
          <Route path="my-requests" element={<PlaceholderPage title="My Emergency Requests" />} />
          <Route path="notifications" element={<PlaceholderPage title="In-App Notifications" />} />
          <Route path="volunteer" element={<PlaceholderPage title="Volunteer Portal" />} />
          <Route path="admin/*" element={<PlaceholderPage title="Admin Control Center" />} />
          <Route path="*" element={<PlaceholderPage title="Page Not Found (404)" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
