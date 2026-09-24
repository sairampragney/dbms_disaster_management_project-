import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { RoleRoute } from './components/auth/RoleRoute';
import { MainLayout } from './components/layout/MainLayout';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { AlertsPage } from './pages/AlertsPage';
import { AlertDetailPage } from './pages/AlertDetailPage';
import { AdminAlertsPage } from './pages/admin/AdminAlertsPage';
import { ReportIncidentPage } from './pages/ReportIncidentPage';
import { MyIncidentsPage } from './pages/MyIncidentsPage';
import { IncidentDetailPage } from './pages/IncidentDetailPage';
import { AdminIncidentsPage } from './pages/admin/AdminIncidentsPage';
import { AdminIncidentDetailPage } from './pages/admin/AdminIncidentDetailPage';
import { CreateEmergencyRequestPage } from './pages/CreateEmergencyRequestPage';
import { MyEmergencyRequestsPage } from './pages/MyEmergencyRequestsPage';
import { EmergencyRequestDetailPage } from './pages/EmergencyRequestDetailPage';
import { AdminEmergencyRequestsPage } from './pages/admin/AdminEmergencyRequestsPage';
import { AdminEmergencyRequestDetailPage } from './pages/admin/AdminEmergencyRequestDetailPage';
import { SafeLocationsPage } from './pages/SafeLocationsPage';
import { SafeLocationDetailPage } from './pages/SafeLocationDetailPage';
import { AdminSafeLocationsPage } from './pages/admin/AdminSafeLocationsPage';
import { AdminSafeLocationDetailPage } from './pages/admin/AdminSafeLocationDetailPage';
import { VolunteerApplyPage } from './pages/VolunteerApplyPage';
import { VolunteerDashboardPage } from './pages/VolunteerDashboardPage';
import { VolunteerProfilePage } from './pages/VolunteerProfilePage';
import { VolunteerTasksPage } from './pages/VolunteerTasksPage';
import { VolunteerTaskDetailPage } from './pages/VolunteerTaskDetailPage';
import { AdminVolunteersPage } from './pages/admin/AdminVolunteersPage';
import { AdminVolunteerDetailPage } from './pages/admin/AdminVolunteerDetailPage';

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
            <Route path="alerts" element={<AlertsPage />} />
            <Route path="alerts/:alertId" element={<AlertDetailPage />} />

            {/* Safe Locations Public / Citizen Routes */}
            <Route path="safe-locations" element={<SafeLocationsPage />} />
            <Route path="safe-locations/:locationId" element={<SafeLocationDetailPage />} />

            <Route path="emergency" element={<CreateEmergencyRequestPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />

            {/* Authenticated Citizen / General Routes */}
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
              path="incidents/report"
              element={
                <ProtectedRoute>
                  <ReportIncidentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="my-incidents"
              element={
                <ProtectedRoute>
                  <MyIncidentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="incidents/:incidentId"
              element={
                <ProtectedRoute>
                  <IncidentDetailPage />
                </ProtectedRoute>
              }
            />

            {/* Emergency Requests Citizen Routes */}
            <Route
              path="emergency-requests/new"
              element={
                <ProtectedRoute>
                  <CreateEmergencyRequestPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="my-emergency-requests"
              element={
                <ProtectedRoute>
                  <MyEmergencyRequestsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="my-requests"
              element={
                <ProtectedRoute>
                  <MyEmergencyRequestsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="emergency-requests/:requestId"
              element={
                <ProtectedRoute>
                  <EmergencyRequestDetailPage />
                </ProtectedRoute>
              }
            />

            {/* Citizen Volunteer Application Route */}
            <Route
              path="volunteer/apply"
              element={
                <ProtectedRoute>
                  <VolunteerApplyPage />
                </ProtectedRoute>
              }
            />

            {/* Approved Volunteer Routes */}
            <Route
              path="volunteer"
              element={
                <RoleRoute allowedRoles={['VOLUNTEER', 'ADMIN']}>
                  <VolunteerDashboardPage />
                </RoleRoute>
              }
            />
            <Route
              path="volunteer/dashboard"
              element={
                <RoleRoute allowedRoles={['VOLUNTEER', 'ADMIN']}>
                  <VolunteerDashboardPage />
                </RoleRoute>
              }
            />
            <Route
              path="volunteer/profile"
              element={
                <RoleRoute allowedRoles={['VOLUNTEER', 'ADMIN']}>
                  <VolunteerProfilePage />
                </RoleRoute>
              }
            />
            <Route
              path="volunteer/tasks"
              element={
                <RoleRoute allowedRoles={['VOLUNTEER', 'ADMIN']}>
                  <VolunteerTasksPage />
                </RoleRoute>
              }
            />
            <Route
              path="volunteer/tasks/:requestId"
              element={
                <RoleRoute allowedRoles={['VOLUNTEER', 'ADMIN']}>
                  <VolunteerTaskDetailPage />
                </RoleRoute>
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

            {/* Admin Protected Routes */}
            <Route
              path="admin/alerts"
              element={
                <RoleRoute allowedRoles={['ADMIN']}>
                  <AdminAlertsPage />
                </RoleRoute>
              }
            />
            <Route
              path="admin/incidents"
              element={
                <RoleRoute allowedRoles={['ADMIN']}>
                  <AdminIncidentsPage />
                </RoleRoute>
              }
            />
            <Route
              path="admin/incidents/:incidentId"
              element={
                <RoleRoute allowedRoles={['ADMIN']}>
                  <AdminIncidentDetailPage />
                </RoleRoute>
              }
            />
            <Route
              path="admin/emergency-requests"
              element={
                <RoleRoute allowedRoles={['ADMIN']}>
                  <AdminEmergencyRequestsPage />
                </RoleRoute>
              }
            />
            <Route
              path="admin/emergency-requests/:requestId"
              element={
                <RoleRoute allowedRoles={['ADMIN']}>
                  <AdminEmergencyRequestDetailPage />
                </RoleRoute>
              }
            />
            <Route
              path="admin/safe-locations"
              element={
                <RoleRoute allowedRoles={['ADMIN']}>
                  <AdminSafeLocationsPage />
                </RoleRoute>
              }
            />
            <Route
              path="admin/safe-locations/:locationId"
              element={
                <RoleRoute allowedRoles={['ADMIN']}>
                  <AdminSafeLocationDetailPage />
                </RoleRoute>
              }
            />
            <Route
              path="admin/volunteers"
              element={
                <RoleRoute allowedRoles={['ADMIN']}>
                  <AdminVolunteersPage />
                </RoleRoute>
              }
            />
            <Route
              path="admin/volunteers/:uid"
              element={
                <RoleRoute allowedRoles={['ADMIN']}>
                  <AdminVolunteerDetailPage />
                </RoleRoute>
              }
            />
            <Route
              path="admin/*"
              element={
                <RoleRoute allowedRoles={['ADMIN']}>
                  <AdminAlertsPage />
                </RoleRoute>
              }
            />

            <Route path="*" element={<PlaceholderPage title="Page Not Found (404)" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};
