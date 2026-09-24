import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createAdminNotification } from '../../services/notificationService';
import {
  NotificationType,
  NotificationPriority,
  RelatedEntityType,
  NOTIFICATION_TYPE_LABELS,
} from '../../types/notification';
import { Bell, Send, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminNotificationsPage: React.FC = () => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    recipientId: '',
    title: '',
    message: '',
    notificationType: 'DISASTER_ALERT' as NotificationType,
    priority: 'HIGH' as NotificationPriority,
    relatedEntityType: '' as RelatedEntityType | '',
    relatedEntityId: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setActionSuccess(null);

    if (!user) {
      setError('Not authenticated.');
      return;
    }

    if (!formData.recipientId.trim() || !formData.title.trim() || !formData.message.trim()) {
      setError('Please fill in required fields (Recipient UID, Title, and Message).');
      return;
    }

    setSubmitting(true);

    try {
      const newId = await createAdminNotification({
        recipientId: formData.recipientId.trim(),
        title: formData.title.trim(),
        message: formData.message.trim(),
        notificationType: formData.notificationType,
        priority: formData.priority,
        relatedEntityType: (formData.relatedEntityType as RelatedEntityType) || null,
        relatedEntityId: formData.relatedEntityId.trim() || null,
        createdBy: user.uid,
      });

      setActionSuccess(`Targeted notification dispatched successfully (ID #${newId.slice(0, 8)}).`);
      setFormData({
        recipientId: '',
        title: '',
        message: '',
        notificationType: 'DISASTER_ALERT',
        priority: 'HIGH',
        relatedEntityType: '',
        relatedEntityId: '',
      });
    } catch (err: any) {
      console.error('Create notification error:', err);
      setError(err.message || 'Failed to dispatch notification.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/admin/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Admin Operational Dashboard</span>
        </Link>
      </div>

      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm space-y-2 border border-slate-800">
        <div className="inline-flex items-center gap-1.5 bg-sky-500/20 border border-sky-500/40 px-3 py-1 rounded-full text-xs font-semibold text-sky-300">
          <Bell className="w-3.5 h-3.5" />
          <span>Admin Dispatch Composer</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold">Dispatch Targeted Emergency Notification</h1>
        <p className="text-xs text-slate-300 leading-relaxed">
          Send direct emergency advisories, status updates, or volunteer dispatches to a specific citizen or responder UID.
        </p>
      </div>

      {actionSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Target Recipient Auth UID</label>
          <input
            type="text"
            name="recipientId"
            value={formData.recipientId}
            onChange={handleChange}
            placeholder="e.g. User Firebase Auth UID"
            required
            className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500 font-mono"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notification Category</label>
            <select
              name="notificationType"
              value={formData.notificationType}
              onChange={handleChange}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500 bg-white"
            >
              {Object.entries(NOTIFICATION_TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Urgency Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500 bg-white"
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Title / Headline</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Emergency Assistance Request Status Update"
            required
            className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Message Content</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={4}
            placeholder="Enter full advisory text or response instruction..."
            required
            className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Related Entity Type (Optional)</label>
            <select
              name="relatedEntityType"
              value={formData.relatedEntityType}
              onChange={handleChange}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500 bg-white"
            >
              <option value="">None / General System Notice</option>
              <option value="ALERT">Disaster Alert</option>
              <option value="INCIDENT">Incident Report</option>
              <option value="EMERGENCY_REQUEST">Emergency Request</option>
              <option value="VOLUNTEER">Volunteer Application</option>
              <option value="SAFE_LOCATION">Safe Location Facility</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Related Entity Document ID (Optional)</label>
            <input
              type="text"
              name="relatedEntityId"
              value={formData.relatedEntityId}
              onChange={handleChange}
              placeholder="e.g. Document ID for navigation link"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500 font-mono"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-2.5 rounded-xl shadow-sm text-xs sm:text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
        >
          <Send className="w-4 h-4" />
          <span>{submitting ? 'Dispatching Notification...' : 'Send Notification'}</span>
        </button>
      </form>
    </div>
  );
};
