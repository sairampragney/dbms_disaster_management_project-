import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getVolunteerTasks } from '../services/volunteerService';
import { EmergencyRequest, REQUEST_TYPE_LABELS, REQUEST_STATUS_LABELS, PRIORITY_COLORS } from '../types/emergencyRequest';
import { ClipboardList, MapPin, Calendar, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

export const VolunteerTasksPage: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<EmergencyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchTasks = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getVolunteerTasks(user.uid);
        setTasks(data);
      } catch (err) {
        console.error('Error fetching volunteer tasks:', err);
        setError('Failed to load assigned response tasks.');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
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
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 rounded-full text-xs font-semibold text-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Volunteer Task Dispatch</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">Assigned Response Tasks</h1>
          <p className="text-xs text-slate-300">
            Accept dispatches, initiate emergency responses, and update fulfillment progress.
          </p>
        </div>

        <Link
          to="/volunteer/dashboard"
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 transition-colors shrink-0"
        >
          <span>Volunteer Portal</span>
        </Link>
      </div>

      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-slate-500">Loading assigned tasks...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-center space-y-2 text-xs text-red-800">
          <AlertCircle className="w-6 h-6 text-red-600 mx-auto" />
          <p className="font-bold">{error}</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-4 shadow-sm">
          <ClipboardList className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-900 text-base">No Assigned Response Tasks</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            You currently have no emergency requests assigned to your volunteer profile.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.map((item) => {
            const priorityStyle = PRIORITY_COLORS[item.priority];
            return (
              <div
                key={item.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col justify-between hover:border-emerald-300 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded border ${priorityStyle.bg} ${priorityStyle.text} ${priorityStyle.border}`}
                    >
                      {item.priority} PRIORITY
                    </span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                      {REQUEST_STATUS_LABELS[item.status]}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base leading-snug">
                    <Link
                      to={`/volunteer/tasks/${item.id}`}
                      className="hover:text-emerald-700 transition-colors"
                    >
                      {item.title}
                    </Link>
                  </h3>

                  <p className="text-xs text-slate-500 font-medium">
                    Category: {REQUEST_TYPE_LABELS[item.requestType]}
                  </p>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{item.location}, {item.city}</span>
                    </div>
                    <div className="flex items-center gap-1 justify-end">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{formatDate(item.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-400 font-mono">Ref #{item.id.slice(0, 8)}</span>
                    <Link
                      to={`/volunteer/tasks/${item.id}`}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                    >
                      <span>Manage Task</span>
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
