import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createAlert, updateAlert, resolveAlert } from '../../services/alertService';
import { Alert, DisasterType, AlertSeverity, AlertStatus, DISASTER_TYPE_LABELS } from '../../types/alert';
import { collection, getDocs, query, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { AlertBadge } from '../../components/alerts/AlertBadge';
import { INDIAN_STATES_AND_UTS } from '../../constants/indiaData';
import { Plus, RefreshCw, X, ShieldCheck } from 'lucide-react';

export const AdminAlertsPage: React.FC = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    disasterType: 'HEAVY_RAINFALL' as DisasterType,
    severity: 'MEDIUM' as AlertSeverity,
    affectedArea: '',
    city: 'Hyderabad',
    district: 'Hyderabad',
    state: 'Telangana',
    latitude: '17.3850',
    longitude: '78.4867',
    recommendedAction: '',
    expiryDays: '3',
    isPublic: true,
  });

  const [submitting, setSaving] = useState(false);

  const loadAllAlerts = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'alerts'), orderBy('createdAt', 'desc'), limit(50));
      const querySnap = await getDocs(q);
      const list: Alert[] = [];
      querySnap.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...(docSnap.data() as Omit<Alert, 'id'>) });
      });
      setAlerts(list);
    } catch (err) {
      console.error('Error loading admin alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAlerts();
  }, []);

  const openCreateModal = () => {
    setEditingAlert(null);
    setFormData({
      title: '',
      description: '',
      disasterType: 'HEAVY_RAINFALL',
      severity: 'MEDIUM',
      affectedArea: '',
      city: 'Hyderabad',
      district: 'Hyderabad',
      state: 'Telangana',
      latitude: '17.3850',
      longitude: '78.4867',
      recommendedAction: '',
      expiryDays: '3',
      isPublic: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (alertItem: Alert) => {
    setEditingAlert(alertItem);
    setFormData({
      title: alertItem.title,
      description: alertItem.description,
      disasterType: alertItem.disasterType,
      severity: alertItem.severity,
      affectedArea: alertItem.affectedArea,
      city: alertItem.city,
      district: alertItem.district,
      state: alertItem.state,
      latitude: alertItem.latitude?.toString() || '17.3850',
      longitude: alertItem.longitude?.toString() || '78.4867',
      recommendedAction: alertItem.recommendedAction,
      expiryDays: '3',
      isPublic: alertItem.isPublic,
    });
    setModalOpen(true);
  };

  const handleResolve = async (alertId: string) => {
    try {
      await resolveAlert(alertId);
      await loadAllAlerts();
    } catch (err) {
      console.error('Error resolving alert:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    try {
      const now = new Date();
      const expiresAtDate = new Date(now.getTime() + parseInt(formData.expiryDays, 10) * 24 * 60 * 60 * 1000);

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        disasterType: formData.disasterType,
        severity: formData.severity,
        affectedArea: formData.affectedArea.trim(),
        city: formData.city.trim(),
        district: formData.district.trim(),
        state: formData.state.trim(),
        latitude: parseFloat(formData.latitude) || 17.3850,
        longitude: parseFloat(formData.longitude) || 78.4867,
        status: 'ACTIVE' as AlertStatus,
        createdBy: user.uid,
        expiresAt: Timestamp.fromDate(expiresAtDate),
        isPublic: formData.isPublic,
        recommendedAction: formData.recommendedAction.trim() || 'Follow local municipal authority instructions.',
      };

      if (editingAlert) {
        await updateAlert(editingAlert.id, payload);
      } else {
        await createAlert(payload);
      }

      setModalOpen(false);
      await loadAllAlerts();
    } catch (err) {
      console.error('Failed to save alert:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-sky-500/20 border border-sky-500/40 px-3 py-1 rounded-full text-xs font-semibold text-sky-300">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">Disaster Alert Management</h1>
          <p className="text-xs text-slate-300">Issue, update, and resolve disaster advisories across India.</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={loadAllAlerts}
            disabled={loading}
            className="bg-white/10 hover:bg-white/20 text-white font-medium px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={openCreateModal}
            className="bg-sky-600 hover:bg-sky-700 text-white font-bold px-4 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Issue New Alert</span>
          </button>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center space-y-2">
            <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-500">Loading alerts collection...</p>
          </div>
        ) : alerts.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 space-y-3">
            <p>No disaster alerts created yet in the database.</p>
            <button onClick={openCreateModal} className="text-sky-600 font-bold hover:underline">
              Create the first alert
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 uppercase font-semibold text-slate-500 text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Severity & Title</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Region</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Public</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {alerts.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <div className="space-y-1">
                        <AlertBadge severity={item.severity} size="sm" />
                        <span className="block font-bold text-slate-900">{item.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{DISASTER_TYPE_LABELS[item.disasterType]}</td>
                    <td className="px-4 py-3">{item.city}, {item.state}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        item.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{item.isPublic ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(item)}
                        className="text-sky-600 font-bold hover:underline"
                      >
                        Edit
                      </button>
                      {item.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleResolve(item.id)}
                          className="text-emerald-600 font-bold hover:underline"
                        >
                          Resolve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900">
                {editingAlert ? 'Edit Disaster Alert' : 'Issue New Disaster Alert'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Alert Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Heavy Rainfall Advisory - Hyderabad"
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Disaster Type</label>
                  <select
                    value={formData.disasterType}
                    onChange={(e) => setFormData({ ...formData, disasterType: e.target.value as DisasterType })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                  >
                    {Object.entries(DISASTER_TYPE_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Severity</label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value as AlertSeverity })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Detailed warning information..."
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Affected Area</label>
                  <input
                    type="text"
                    value={formData.affectedArea}
                    onChange={(e) => setFormData({ ...formData, affectedArea: e.target.value })}
                    placeholder="Begumpet, Kukatpally"
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                  >
                    {INDIAN_STATES_AND_UTS.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Recommended Action</label>
                <input
                  type="text"
                  value={formData.recommendedAction}
                  onChange={(e) => setFormData({ ...formData, recommendedAction: e.target.value })}
                  placeholder="Avoid low-lying underpasses..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublic}
                    onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                    className="rounded text-sky-600 focus:ring-sky-500"
                  />
                  <span>Publish to Public Feed</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-bold bg-sky-600 text-white hover:bg-sky-700 rounded-lg shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingAlert ? 'Update Alert' : 'Issue Alert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
