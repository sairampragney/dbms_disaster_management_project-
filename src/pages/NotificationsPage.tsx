import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../services/notificationService';
import {
  AppNotification,
  NOTIFICATION_TYPE_LABELS,
  NOTIFICATION_PRIORITY_COLORS,
  getRelatedEntityRoute,
} from '../types/notification';
import {
  Bell,
  CheckCircle2,
  CheckCheck,
  AlertCircle,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

export const NotificationsPage: React.FC = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'READ'>('ALL');

  const fetchNotifications = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getMyNotifications(user.uid);
      setNotifications(data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
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

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await markNotificationAsRead(id);
      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    try {
      await markAllNotificationsAsRead(user.uid);
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleNotificationClick = async (item: AppNotification) => {
    if (!item.isRead) {
      try {
        await markNotificationAsRead(item.id);
      } catch (err) {
        console.error('Error marking notification read on click:', err);
      }
    }

    const route = getRelatedEntityRoute(
      item.relatedEntityType,
      item.relatedEntityId,
      userProfile?.role
    );

    if (route) {
      navigate(route);
    } else {
      navigate(`/notifications/${item.id}`);
    }
  };

  const filteredNotifications = notifications.filter((item) => {
    if (filter === 'UNREAD') return !item.isRead;
    if (filter === 'READ') return item.isRead;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-sky-500/20 border border-sky-500/40 px-3 py-1 rounded-full text-xs font-semibold text-sky-300">
            <Bell className="w-3.5 h-3.5" />
            <span>Emergency Notification Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">In-App Notifications</h1>
          <p className="text-xs text-slate-300">
            {unreadCount > 0
              ? `You have ${unreadCount} unread emergency advisories and status updates.`
              : 'All notifications are caught up.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={fetchNotifications}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-2 rounded-xl border border-slate-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark All Read</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-xs flex items-center gap-2 text-xs font-semibold">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-4 py-1.5 rounded-xl transition-colors ${
            filter === 'ALL' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('UNREAD')}
          className={`px-4 py-1.5 rounded-xl transition-colors ${
            filter === 'UNREAD' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={() => setFilter('READ')}
          className={`px-4 py-1.5 rounded-xl transition-colors ${
            filter === 'READ' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Read ({notifications.length - unreadCount})
        </button>
      </div>

      {/* List Feed */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-slate-500">Loading notifications...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-center space-y-2 text-xs text-red-800">
          <AlertCircle className="w-6 h-6 text-red-600 mx-auto" />
          <p className="font-bold">{error}</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-3 shadow-sm">
          <Bell className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-900 text-base">No Notifications Found</h3>
          <p className="text-xs text-slate-500">No emergency notifications match your filter selection.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((item) => {
            const priorityStyle = NOTIFICATION_PRIORITY_COLORS[item.priority];
            return (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                className={`bg-white border rounded-2xl p-5 shadow-xs transition-colors cursor-pointer space-y-2 ${
                  item.isRead ? 'border-slate-200 opacity-80' : 'border-sky-300 ring-1 ring-sky-200'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded border ${priorityStyle.bg} ${priorityStyle.text} ${priorityStyle.border}`}
                    >
                      {item.priority}
                    </span>
                    <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {NOTIFICATION_TYPE_LABELS[item.notificationType] || item.notificationType}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400">{formatDate(item.createdAt)}</span>
                </div>

                <div className="space-y-1">
                  <h3 className={`text-base font-bold text-slate-900 flex items-center gap-1.5 ${!item.isRead ? 'text-sky-950 font-extrabold' : ''}`}>
                    {!item.isRead && <span className="w-2 h-2 rounded-full bg-sky-600 shrink-0"></span>}
                    <span>{item.title}</span>
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{item.message}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-slate-500">
                    {item.relatedEntityType && (
                      <span className="text-[11px] font-medium text-sky-700 flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" />
                        <span>View Related {item.relatedEntityType}</span>
                      </span>
                    )}
                  </div>

                  {!item.isRead && (
                    <button
                      onClick={(e) => handleMarkAsRead(item.id, e)}
                      className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Read</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
