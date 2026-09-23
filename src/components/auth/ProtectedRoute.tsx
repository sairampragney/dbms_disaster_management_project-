import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, status } = useAuth();
  const location = useLocation();

  if (status === 'INITIALIZING') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-sky-600" />
          <span>Verifying authentication...</span>
        </div>
      </div>
    );
  }

  if (!user || status === 'UNAUTHENTICATED') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
