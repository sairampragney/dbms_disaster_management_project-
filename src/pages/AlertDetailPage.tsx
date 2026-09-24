import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAlertById } from '../services/alertService';
import { Alert, DISASTER_TYPE_LABELS } from '../types/alert';
import { AlertBadge } from '../components/alerts/AlertBadge';
import { MapPin, Calendar, ArrowLeft, PhoneCall, ShieldAlert, CheckCircle, Clock } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

export const AlertDetailPage: React.FC = () => {
  const { alertId } = useParams<{ alertId: string }>();
  const [alert, setAlert] = useState<Alert | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!alertId) return;
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAlertById(alertId);
        if (data) {
          setAlert(data);
        } else {
          setError('Disaster alert advisory not found or has been removed.');
        }
      } catch (err) {
        console.error('Error loading alert detail:', err);
        setError('Failed to load alert details. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [alertId]);

  const formatDate = (dateVal: Timestamp | Date) => {
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
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-semibold text-slate-500">Loading disaster alert details...</p>
      </div>
    );
  }

  if (error || !alert) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl space-y-3">
          <ShieldAlert className="w-8 h-8 text-red-600 mx-auto" />
          <h2 className="text-lg font-bold text-red-900">Alert Unavailable</h2>
          <p className="text-xs text-red-700">{error || 'This advisory is no longer accessible.'}</p>
        </div>
        <Link to="/alerts" className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:underline">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Alerts</span>
        </Link>
      </div>
    );
  }

  const isCritical = alert.severity === 'CRITICAL';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Back Link */}
      <Link to="/alerts" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-sky-600 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Public Alerts</span>
      </Link>

      {/* Main Advisory Banner */}
      <div className={`bg-white border rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 ${
        isCritical ? 'border-red-300 ring-2 ring-red-200' : 'border-slate-200'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <AlertBadge severity={alert.severity} size="lg" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
              {DISASTER_TYPE_LABELS[alert.disasterType]}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border">
            {alert.status === 'ACTIVE' ? (
              <span className="text-emerald-700 bg-emerald-50 border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> ACTIVE ADVISORY
              </span>
            ) : (
              <span className="text-slate-600 bg-slate-100 border-slate-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> RESOLVED
              </span>
            )}
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight mb-2">
            {alert.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span className="font-medium text-slate-700">{alert.affectedArea}, {alert.city}, {alert.district}, {alert.state}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Issued: {formatDate(alert.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Emergency Callout for Critical Alerts */}
        {isCritical && (
          <div className="bg-red-600 text-white rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
            <div className="space-y-1 text-center sm:text-left">
              <span className="font-extrabold text-sm uppercase tracking-wider text-red-100 block">Critical Situation Advisory</span>
              <p className="text-xs text-red-50">Immediate danger to life or property. If you need urgent rescue or assistance, call national emergency services.</p>
            </div>
            <a
              href="tel:112"
              className="bg-white text-red-700 hover:bg-red-50 font-bold px-5 py-2.5 rounded-lg text-xs sm:text-sm shrink-0 flex items-center gap-2 shadow-sm transition-colors"
            >
              <PhoneCall className="w-4 h-4 animate-pulse" />
              <span>Call 112 Directly</span>
            </a>
          </div>
        )}

        {/* Description */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Advisory Description</h3>
          <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-100">
            {alert.description}
          </p>
        </div>

        {/* Recommended Safety Action */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700">Recommended Public Safety Action</h3>
          <div className="bg-amber-50 border border-amber-200 text-amber-950 p-4 rounded-xl text-xs sm:text-sm leading-relaxed font-medium">
            {alert.recommendedAction || 'Follow local municipal authority instructions and avoid flooded or hazardous zones.'}
          </div>
        </div>

        {/* Timestamps Footer */}
        <div className="border-t border-slate-100 pt-4 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
          <span>Official Advisory Reference #{alert.id.slice(0, 8)}</span>
          <span>Valid Until: {formatDate(alert.expiresAt)}</span>
        </div>
      </div>
    </div>
  );
};
