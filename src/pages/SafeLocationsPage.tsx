import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPublicSafeLocations } from '../services/safeLocationService';
import {
  SafeLocation,
  LocationType,
  AvailabilityStatus,
  LOCATION_TYPE_LABELS,
  AVAILABILITY_STATUS_LABELS,
  AVAILABILITY_COLORS,
  getDirectionsUrl,
} from '../types/safeLocation';
import {
  MapPin,
  Building2,
  Filter,
  Search,
  Phone,
  Navigation,
  ShieldCheck,
  AlertCircle,
  PhoneCall,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

export const SafeLocationsPage: React.FC = () => {
  const [locations, setLocations] = useState<SafeLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [typeFilter, setTypeFilter] = useState<LocationType | 'ALL'>('ALL');
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityStatus | 'ALL'>('ALL');
  const [stateFilter, setStateFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLocations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPublicSafeLocations({
        locationType: typeFilter,
        availabilityStatus: availabilityFilter,
        state: stateFilter,
        city: cityFilter,
      });
      setLocations(data);
    } catch (err) {
      console.error('Failed to load public safe locations:', err);
      setError('Failed to load safe locations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [typeFilter, availabilityFilter, stateFilter, cityFilter]);

  const filteredLocations = locations.filter((loc) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      loc.name.toLowerCase().includes(query) ||
      loc.address.toLowerCase().includes(query) ||
      loc.city.toLowerCase().includes(query) ||
      loc.district.toLowerCase().includes(query) ||
      (loc.landmark && loc.landmark.toLowerCase().includes(query))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Hero / Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 rounded-full text-xs font-semibold text-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Evacuation & Support Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">Safe Locations & Relief Shelters</h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Find active emergency shelters, evacuation centers, medical facilities, police stations, and community relief centers across India.
          </p>
          <p className="text-[11px] text-amber-300 font-medium">
            Demo / Demonstration Data • Centered on Hyderabad, Telangana
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
          <a
            href="tel:112"
            className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-colors"
          >
            <PhoneCall className="w-4 h-4 animate-pulse" />
            <span>Call 112 Emergency</span>
          </a>
          <button
            onClick={fetchLocations}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 pb-1 border-b border-slate-100">
          <Filter className="w-4 h-4 text-slate-500" />
          <span>Filter Safe Locations</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Facility Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="ALL">All Facility Types</option>
              {Object.entries(LOCATION_TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Availability</label>
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="AVAILABLE">Available (Accepting)</option>
              <option value="LIMITED">Limited Capacity</option>
              <option value="FULL">Full Capacity</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">State</label>
            <input
              type="text"
              placeholder="e.g. Telangana"
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">City</label>
            <input
              type="text"
              placeholder="e.g. Hyderabad"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Search Keywords</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Name, landmark..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-slate-500">Searching active safe locations...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-center space-y-2 text-xs text-red-800">
          <AlertCircle className="w-6 h-6 text-red-600 mx-auto" />
          <p className="font-bold">{error}</p>
        </div>
      ) : filteredLocations.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-3 shadow-sm">
          <Building2 className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-900 text-base">No Safe Locations Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            No active emergency shelters or support facilities match your filter parameters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLocations.map((item) => {
            const statusStyle = AVAILABILITY_COLORS[item.availabilityStatus];
            const mapsUrl = getDirectionsUrl(
              item.latitude,
              item.longitude,
              item.address,
              item.city,
              item.state
            );

            return (
              <div
                key={item.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between hover:border-emerald-300 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      {LOCATION_TYPE_LABELS[item.locationType]}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                    >
                      {AVAILABILITY_STATUS_LABELS[item.availabilityStatus]}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-lg leading-snug">
                    <Link to={`/safe-locations/${item.id}`} className="hover:text-emerald-700 transition-colors">
                      {item.name}
                    </Link>
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>
                        {item.address}, {item.city}, {item.state} - {item.pincode}
                      </span>
                    </div>

                    {item.contactPhone && (
                      <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                        <Phone className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                        <a href={`tel:${item.contactPhone}`} className="hover:underline">
                          {item.contactPhone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Get Directions</span>
                  </a>

                  <Link
                    to={`/safe-locations/${item.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-slate-900"
                  >
                    <span>Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
