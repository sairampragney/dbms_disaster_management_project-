import React from 'react';
import { Link } from 'react-router-dom';
import { Alert, DISASTER_TYPE_LABELS } from '../../types/alert';
import { AlertBadge } from './AlertBadge';
import { MapPin, Calendar, ArrowRight, PhoneCall } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

interface AlertCardProps {
  alert: Alert;
}

export const AlertCard: React.FC<AlertCardProps> = ({ alert }) => {
  const formatDate = (dateVal: Timestamp | Date) => {
    if (!dateVal) return '';
    const date = dateVal instanceof Timestamp ? dateVal.toDate() : new Date(dateVal);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata',
    });
  };

  const isCritical = alert.severity === 'CRITICAL';

  return (
    <div className={`bg-white border rounded-2xl p-5 sm:p-6 shadow-xs transition-all hover:shadow-md ${
      isCritical ? 'border-red-300 ring-1 ring-red-200' : 'border-slate-200'
    }`}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <AlertBadge severity={alert.severity} size="sm" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
          {DISASTER_TYPE_LABELS[alert.disasterType]}
        </span>
      </div>

      <h3 className="text-lg font-bold text-slate-900 leading-snug mb-2">
        <Link to={`/alerts/${alert.id}`} className="hover:text-sky-600 transition-colors">
          {alert.title}
        </Link>
      </h3>

      <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed">
        {alert.description}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-500 mb-4 border-t border-slate-100 pt-3">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{alert.affectedArea}, {alert.city}, {alert.state}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{formatDate(alert.createdAt)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-2">
        {isCritical && (
          <a
            href="tel:112"
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-xs transition-colors shrink-0"
          >
            <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
            <span>Call 112</span>
          </a>
        )}
        <Link
          to={`/alerts/${alert.id}`}
          className="ml-auto text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1 transition-colors"
        >
          <span>View Details & Actions</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
