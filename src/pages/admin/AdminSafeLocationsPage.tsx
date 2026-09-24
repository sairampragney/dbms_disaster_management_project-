import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getAdminSafeLocations,
  deactivateSafeLocation,
  reactivateSafeLocation,
} from '../../services/safeLocationService';
import {
  SafeLocation,
  LocationType,
  AvailabilityStatus,
  LOCATION_TYPE_LABELS,
  AVAILABILITY_STATUS_LABELS,
  AVAILABILITY_COLORS,
} from '../../types/safeLocation';
import {
  Plus,
  Search,
  Filter,
  Building2,
  MapPin,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Power,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const AdminSafeLocationsPage: React.FC = () => {
  const [locations, setLocations] = useState<SafeLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const [typeFilter, setTypeFilter] = useState<LocationType | 'ALL'>('ALL');
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLocations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminSafeLocations();
      setLocations(data);
    } catch (err) {
      console.error('Failed to load admin safe locations:', err);
      setError('Unable to load safe locations directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleToggleActive = async (loc: SafeLocation) => {
    setError(null);
    try {
      if (loc.isActive) {
        if (!window.confirm(`Deactivate safe location '${loc.name}'?`)) return;
        await deactivateSafeLocation(loc.id);
        setActionSuccess(`Facility '${loc.name}' deactivated.`);
      } else {
        await reactivateSafeLocation(loc.id);
        setActionSuccess(`Facility '${loc.name}' reactivated.`);
      }
      await fetchLocations();
    } catch (err: any) {
      console.error('Failed to update activation state:', err);
      setError(err.message || 'Failed to update facility activation state.');
    }
  };

  const filteredLocations = locations.filter((loc) => {
    if (typeFilter !== 'ALL' && loc.locationType !== typeFilter) return false;
    if (availabilityFilter !== 'ALL' && loc.availabilityStatus !== availabilityFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      loc.name.toLowerCase().includes(q) ||
      loc.address.toLowerCase().includes(q) ||
      loc.city.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 rounded-full text-xs font-semibold text-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Shelter Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">Manage Safe Locations & Shelters</h1>
          <p className="text-xs text-slate-300">
            Add evacuation centers, update shelter availability and capacity metrics, and toggle active support status.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={fetchLocations}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 border border-slate-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <Link
            to="/admin/safe-locations/new"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Safe Location</span>
          </Link>
        </div>
      </div>

      {actionSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 pb-1 border-b border-slate-100">
          <Filter className="w-4 h-4 text-slate-500" />
          <span>Facility Filters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Facility Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="ALL">All Types</option>
              {Object.entries(LOCATION_TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Availability Status</label>
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="ALL">All Availability Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="LIMITED">Limited</option>
              <option value="FULL">Full</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Search Keywords</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Facility name, city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-slate-500">Loading safe locations directory...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-center text-xs text-red-800 space-y-2">
          <AlertCircle className="w-6 h-6 text-red-600 mx-auto" />
          <p className="font-bold">{error}</p>
        </div>
      ) : filteredLocations.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-3 shadow-sm">
          <Building2 className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-900 text-base">No Facilities Found</h3>
          <p className="text-xs text-slate-500">No safe locations match your filter parameters.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="p-4">Facility Name & Type</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Availability</th>
                  <th className="p-4">Capacity</th>
                  <th className="p-4">Active State</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLocations.map((item) => {
                  const statusStyle = AVAILABILITY_COLORS[item.availabilityStatus];
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 space-y-0.5">
                        <Link
                          to={`/admin/safe-locations/${item.id}`}
                          className="font-bold text-slate-900 hover:text-emerald-700 transition-colors block text-sm"
                        >
                          {item.name}
                        </Link>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {LOCATION_TYPE_LABELS[item.locationType]}
                        </span>
                      </td>

                      <td className="p-4 text-[11px] text-slate-600 space-y-0.5">
                        <div className="flex items-center gap-1 font-semibold">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{item.city}, {item.state}</span>
                        </div>
                        <p className="text-slate-400 truncate max-w-xs">{item.address}</p>
                      </td>

                      <td className="p-4">
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                        >
                          {AVAILABILITY_STATUS_LABELS[item.availabilityStatus]}
                        </span>
                      </td>

                      <td className="p-4 text-xs font-semibold text-slate-700">
                        {item.capacity !== null ? `${item.capacity} persons` : 'Unspecified'}
                      </td>

                      <td className="p-4">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            item.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {item.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleActive(item)}
                            title={item.isActive ? 'Deactivate' : 'Reactivate'}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-slate-100 transition-colors"
                          >
                            <Power className="w-4 h-4" />
                          </button>
                          <Link
                            to={`/admin/safe-locations/${item.id}`}
                            className="inline-flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <span>Manage</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
