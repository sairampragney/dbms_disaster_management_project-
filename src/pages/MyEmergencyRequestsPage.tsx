import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyEmergencyRequests } from '../services/emergencyRequestService';
import {
  EmergencyRequest,
  REQUEST_TYPE_LABELS,
  REQUEST_STATUS_LABELS,
  PRIORITY_COLORS,
} from '../types/emergencyRequest';
import { MapPin, Calendar, Plus, AlertCircle, ArrowRight, HeartHandshake } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

export const MyEmergencyRequestsPage: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchRequests = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getMyEmergencyRequests(user.uid);
        setRequests(data);
      } catch (err) {
        console.error('Error fetching emergency requests:', err);
        setError('Failed to load your emergency requests. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [user]);

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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-red-500/20 border border-red-500/40 px-3 py-1 rounded-full text-xs font-semibold text-red-300">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Emergency Aid Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">My Emergency Requests</h1>
          <p className="text-xs text-slate-300">
            Track response progress, volunteer assignments, and fulfillment status for your assistance requests.
          </p>
        </div>

        <Link
          to="/emergency-requests/new"
          className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Emergency Request</span>
        </Link>
      </div>

      {/* Requests Feed */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-slate-500">Loading your emergency requests...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-center space-y-2 text-xs text-red-800">
          <AlertCircle className="w-6 h-6 text-red-600 mx-auto" />
          <p className="font-bold">{error}</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">No Active Assistance Requests</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            You have not created any emergency assistance requests yet.
          </p>
          <Link
            to="/emergency-requests/new"
            className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Request Assistance Now</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requests.map((item) => {
            const priorityStyle = PRIORITY_COLORS[item.priority];
            return (
              <div
                key={item.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded border ${priorityStyle.bg} ${priorityStyle.text} ${priorityStyle.border}`}
                    >
                      {item.priority} PRIORITY
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        item.status === 'ACKNOWLEDGED'
                          ? 'bg-sky-100 text-sky-800'
                          : item.status === 'ASSIGNED'
                          ? 'bg-indigo-100 text-indigo-800'
                          : item.status === 'IN_PROGRESS'
                          ? 'bg-amber-100 text-amber-900'
                          : item.status === 'RESOLVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'CANCELLED'
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {REQUEST_STATUS_LABELS[item.status]}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base leading-snug">
                    <Link
                      to={`/emergency-requests/${item.id}`}
                      className="hover:text-red-600 transition-colors"
                    >
                      {item.title}
                    </Link>
                  </h3>

                  <p className="text-xs text-slate-500 font-medium">
                    Type: {REQUEST_TYPE_LABELS[item.requestType]}
                  </p>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        {item.location}, {item.city}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 justify-end">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{formatDate(item.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-400 font-mono">
                      Ref #{item.id.slice(0, 8)}
                    </span>
                    <Link
                      to={`/emergency-requests/${item.id}`}
                      className="text-xs font-bold text-red-600 hover:text-red-800 flex items-center gap-1"
                    >
                      <span>View Request</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
