import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getNotificationById, markNotificationAsRead } from '../services/notificationService';
import {
  AppNotification,
  NOTIFICATION_TYPE_LABELS,
  NOTIFICATION_PRIORITY_COLORS,
  getRelatedEntityRoute,
} from '../types/notification';
import { Bell, Clock, ArrowLeft, ExternalLink, AlertCircle } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

export const NotificationDetailPage: React.FC = () => {
  const { notificationId } = useParams<{ notificationId: string }>();
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();

  const [notification, setNotification] = useState<AppNotification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!notificationId) return;
    const fetchNotification = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getNotificationById(notificationId);
        if (!data) {
          setError('Notification record not found.');
        } else if (user && data.recipientId !== user.uid && userProfile?.role !== 'ADMIN') {
          setError('You do not have permission to view this notification.');
        } else {
          setNotification(data);
          if (!data.isRead && user && data.recipientId === user.uid) {
            await markNotificationAsRead(data.id);
          }
        }
      } catch (err) {
        console.error('Error fetching notification detail:', err);
        setError('Failed to load notification details.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotification();
  }, [notificationId, user, userProfile]);

  const formatDate = (dateVal: Timestamp | Date | null) => {
    if (!dateVal) return 'N/A';
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

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-semibold text-slate-500">Loading notification detail...</p>
      </div>
    );
  }

  if (error || !notification) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-4 text-center">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 space-y-3">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
          <h2 className="text-lg font-bold text-red-900">{error || 'Notification Not Found'}</h2>
        </div>
        <button
          onClick={() => navigate('/notifications')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-100 px-4 py-2 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Notifications Center</span>
        </button>
      </div>
    );
  }

  const priorityStyle = NOTIFICATION_PRIORITY_COLORS[notification.priority];
  const relatedRoute = getRelatedEntityRoute(
    notification.relatedEntityType,
    notification.relatedEntityId,
    userProfile?.role
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/notifications"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Notifications</span>
        </Link>
        <span className="text-xs font-mono text-slate-400">Ref #{notification.id.slice(0, 8)}</span>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-extrabold uppercase px-3 py-1 rounded-full border ${priorityStyle.bg} ${priorityStyle.text} ${priorityStyle.border}`}
            >
              {notification.priority} Urgency
            </span>
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
              {NOTIFICATION_TYPE_LABELS[notification.notificationType] || notification.notificationType}
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs text-slate-500 font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{formatDate(notification.createdAt)}</span>
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-sky-600 shrink-0" />
            <span>{notification.title}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
            {notification.message}
          </p>
        </div>

        {relatedRoute && (
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => navigate(relatedRoute)}
              className="bg-sky-600 hover:bg-sky-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-colors shadow-sm"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open Related {notification.relatedEntityType} Record</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
