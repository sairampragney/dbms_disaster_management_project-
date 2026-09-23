import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/auth';
import { ShieldAlert, AlertCircle } from 'lucide-react';

interface RoleRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ children, allowedRoles }) => {
  const { user, userProfile, status, role } = useAuth();
  const location = useLocation();

  if (status === 'INITIALIZING') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-sky-600" />
          <span>Verifying role permissions...</span>
        </div>
      </div>
    );
  }

  if (status === 'INACTIVE' || userProfile?.isActive === false) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 bg-red-50 border border-red-200 rounded-2xl text-center space-y-4">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 text-red-600 rounded-xl">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-red-900">Account Deactivated</h2>
        <p className="text-xs text-red-700 leading-relaxed">
          Your account has been deactivated by system administration. Please contact support for assistance.
        </p>
      </div>
    );
  }

  if (!user || status === 'UNAUTHENTICATED') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const currentRole: UserRole = role || 'CITIZEN';

  if (!allowedRoles.includes(currentRole)) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 bg-amber-50 border border-amber-200 rounded-2xl text-center space-y-4">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 text-amber-600 rounded-xl">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-amber-900">Access Restricted</h2>
        <p className="text-xs text-amber-800 leading-relaxed">
          You do not have the required permissions ({allowedRoles.join(' / ')}) to access this page. Your current role is <strong>{currentRole}</strong>.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
