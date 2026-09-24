import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getSafeLocation } from '../services/safeLocationService';
import {
  SafeLocation,
  LOCATION_TYPE_LABELS,
  AVAILABILITY_STATUS_LABELS,
  AVAILABILITY_STATUS_DESCRIPTIONS,
  AVAILABILITY_COLORS,
  LOCATION_SERVICE_LABELS,
  getDirectionsUrl,
} from '../types/safeLocation';
import {
  MapPin,
  Clock,
  Phone,
  Navigation,
  CheckCircle2,
  AlertCircle,
  PhoneCall,
  ArrowLeft,
  Building2,
  Users,
  ShieldCheck,
} from 'lucide-react';

export const SafeLocationDetailPage: React.FC = () => {
  const { locationId } = useParams<{ locationId: string }>();
  const navigate = useNavigate();

  const [location, setLocation] = useState<SafeLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!locationId) return;
    const fetchLocation = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getSafeLocation(locationId);
        if (!data || !data.isActive) {
          setError('Safe location facility record not found or no longer active.');
        } else {
          setLocation(data);
        }
      } catch (err) {
        console.error('Error fetching safe location detail:', err);
        setError('Failed to load safe location details.');
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();
  }, [locationId]);

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-semibold text-slate-500">Loading safe location details...</p>
      </div>
    );
  }

  if (error || !location) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-4 text-center">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 space-y-3">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
          <h2 className="text-lg font-bold text-red-900">{error || 'Facility Not Found'}</h2>
        </div>
        <button
          onClick={() => navigate('/safe-locations')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-100 px-4 py-2 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Safe Locations Directory</span>
        </button>
      </div>
    );
  }

  const statusStyle = AVAILABILITY_COLORS[location.availabilityStatus];
  const directionsUrl = getDirectionsUrl(
    location.latitude,
    location.longitude,
    location.address,
    location.city,
    location.state
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/safe-locations"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Safe Locations</span>
        </Link>
        <span className="text-xs font-mono text-slate-400">Ref #{location.id.slice(0, 8)}</span>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
              {LOCATION_TYPE_LABELS[location.locationType]}
            </span>
          </div>

          <span
            className={`text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
          >
            {AVAILABILITY_STATUS_LABELS[location.availabilityStatus]}
          </span>
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{location.name}</h1>
          <p className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-3 rounded-xl font-medium">
            {AVAILABILITY_STATUS_DESCRIPTIONS[location.availabilityStatus]}
          </p>
          <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-wrap leading-relaxed pt-2">
            {location.description}
          </p>
        </div>

        {/* Grid Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 rounded-xl p-4 border border-slate-100 text-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Location Address</span>
            </div>
            <p className="text-slate-600 pl-5 leading-relaxed">
              {location.address}<br />
              {location.landmark && <span>Landmark: {location.landmark}<br /></span>}
              {location.city}, {location.district}, {location.state} - {location.pincode}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <Building2 className="w-4 h-4 text-sky-600" />
              <span>Facility Metrics & Operating Hours</span>
            </div>
            <div className="pl-5 space-y-1 text-slate-600">
              <p className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>Max Capacity: {location.capacity !== null ? `${location.capacity} persons` : 'Unspecified'}</span>
              </p>
              <p className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Hours: {location.operatingHours || '24/7 Emergency Operation'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Services Badges */}
        <div className="space-y-3 border-t border-slate-100 pt-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Available Emergency Services</span>
          </h3>

          <div className="flex flex-wrap gap-2">
            {location.services && location.services.length > 0 ? (
              location.services.map((svc) => (
                <span
                  key={svc}
                  className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-lg flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{LOCATION_SERVICE_LABELS[svc] || svc}</span>
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500 italic">General relief shelter support</span>
            )}
          </div>
        </div>

        {/* Actions Bar */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {location.contactPhone && (
              <a
                href={`tel:${location.contactPhone}`}
                className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Phone className="w-4 h-4" />
                <span>Call {location.contactPhone}</span>
              </a>
            )}

            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Navigation className="w-4 h-4" />
              <span>Get Google Directions</span>
            </a>
          </div>

          <a
            href="tel:112"
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Call 112 Helpline</span>
          </a>
        </div>
      </div>
    </div>
  );
};
