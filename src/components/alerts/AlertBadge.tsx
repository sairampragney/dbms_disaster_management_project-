import React from 'react';
import { AlertSeverity } from '../../types/alert';
import { AlertTriangle, AlertCircle, Info, ShieldAlert } from 'lucide-react';

interface AlertBadgeProps {
  severity: AlertSeverity;
  size?: 'sm' | 'md' | 'lg';
}

export const AlertBadge: React.FC<AlertBadgeProps> = ({ severity, size = 'md' }) => {
  const config = {
    LOW: {
      label: 'LOW SEVERITY',
      bg: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: <Info className="w-3.5 h-3.5" />,
    },
    MEDIUM: {
      label: 'MEDIUM SEVERITY',
      bg: 'bg-amber-100 text-amber-900 border-amber-200',
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
    },
    HIGH: {
      label: 'HIGH SEVERITY',
      bg: 'bg-orange-100 text-orange-900 border-orange-200',
      icon: <AlertCircle className="w-3.5 h-3.5" />,
    },
    CRITICAL: {
      label: 'CRITICAL EMERGENCY',
      bg: 'bg-red-600 text-white border-red-700 animate-pulse',
      icon: <ShieldAlert className="w-3.5 h-3.5" />,
    },
  }[severity];

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3.5 py-1.5 font-bold',
  }[size];

  return (
    <span className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-md border shadow-xs ${config.bg} ${sizeClasses}`}>
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
};
