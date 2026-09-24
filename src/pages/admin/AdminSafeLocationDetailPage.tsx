import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getSafeLocation,
  createSafeLocation,
  updateSafeLocation,
  deactivateSafeLocation,
  reactivateSafeLocation,
} from '../../services/safeLocationService';
import {
  LocationType,
  AvailabilityStatus,
  LocationService,
  LOCATION_TYPE_LABELS,
  LOCATION_SERVICE_LABELS,
} from '../../types/safeLocation';
import { INDIAN_STATES_AND_UTS, isValidPincode, isValidIndianPhone } from '../../constants/indiaData';
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  AlertCircle,
  Save,
  Power,
} from 'lucide-react';

export const AdminSafeLocationDetailPage: React.FC = () => {
  const { locationId } = useParams<{ locationId: string }>();
  const isNew = locationId === 'new';
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    locationType: 'SHELTER' as LocationType,
    address: '',
    landmark: '',
    city: 'Hyderabad',
    district: 'Hyderabad',
    state: 'Telangana',
    pincode: '500072',
    latitude: '17.3850',
    longitude: '78.4867',
    contactPhone: '+91 98765 43210',
    capacity: '200',
    availabilityStatus: 'AVAILABLE' as AvailabilityStatus,
    operatingHours: '24/7 Emergency Operation',
    isActive: true,
  });

  const [selectedServices, setSelectedServices] = useState<LocationService[]>([
    'SHELTER',
    'FOOD',
    'WATER',
    'FIRST_AID',
  ]);

  const [loading, setLoading] = useState(!isNew);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isNew) return;
    const loadLocation = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getSafeLocation(locationId!);
        if (!data) {
          setError('Safe location record not found.');
        } else {
          setFormData({
            name: data.name,
            description: data.description,
            locationType: data.locationType,
            address: data.address,
            landmark: data.landmark || '',
            city: data.city,
            district: data.district,
            state: data.state,
            pincode: data.pincode,
            latitude: data.latitude !== null ? String(data.latitude) : '',
            longitude: data.longitude !== null ? String(data.longitude) : '',
            contactPhone: data.contactPhone || '',
            capacity: data.capacity !== null ? String(data.capacity) : '',
            availabilityStatus: data.availabilityStatus,
            operatingHours: data.operatingHours || '',
            isActive: data.isActive,
          });
          setSelectedServices(data.services || []);
        }
      } catch (err) {
        console.error('Failed to load safe location details:', err);
        setError('Error loading facility record.');
      } finally {
        setLoading(false);
      }
    };

    loadLocation();
  }, [locationId, isNew]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleServiceToggle = (svc: LocationService) => {
    if (selectedServices.includes(svc)) {
      setSelectedServices(selectedServices.filter((s) => s !== svc));
    } else {
      setSelectedServices([...selectedServices, svc]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setActionSuccess(null);

    if (!formData.name.trim() || !formData.address.trim() || !formData.city.trim() || !formData.state.trim()) {
      setError('Please fill in required fields (Name, Address, City, State).');
      return;
    }

    if (!isValidPincode(formData.pincode)) {
      setError('Please enter a valid 6-digit Indian PIN Code.');
      return;
    }

    if (formData.contactPhone && !isValidIndianPhone(formData.contactPhone)) {
      setError('Please enter a valid 10-digit Indian phone number (e.g. +91 98765 43210).');
      return;
    }

    const latNum = parseFloat(formData.latitude);
    const lngNum = parseFloat(formData.longitude);

    if (isNaN(latNum) || latNum < -90 || latNum > 90) {
      setError('Latitude must be a valid number between -90 and 90.');
      return;
    }

    if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
      setError('Longitude must be a valid number between -180 and 180.');
      return;
    }

    setSubmitting(true);

    try {
      const capVal = formData.capacity.trim() !== '' ? parseInt(formData.capacity, 10) : null;

      if (isNew) {
        if (!user) throw new Error('Not authenticated.');
        const newId = await createSafeLocation({
          name: formData.name,
          description: formData.description,
          locationType: formData.locationType,
          address: formData.address,
          landmark: formData.landmark || null,
          city: formData.city,
          district: formData.district,
          state: formData.state,
          pincode: formData.pincode,
          latitude: latNum,
          longitude: lngNum,
          contactPhone: formData.contactPhone || null,
          capacity: capVal !== null && capVal >= 0 ? capVal : null,
          availabilityStatus: formData.availabilityStatus,
          operatingHours: formData.operatingHours || null,
          services: selectedServices,
          isActive: formData.isActive,
          createdBy: user.uid,
        });

        setActionSuccess('Safe location facility created successfully.');
        setTimeout(() => {
          navigate(`/admin/safe-locations/${newId}`);
        }, 1000);
      } else {
        await updateSafeLocation(locationId!, {
          name: formData.name,
          description: formData.description,
          locationType: formData.locationType,
          address: formData.address,
          landmark: formData.landmark || null,
          city: formData.city,
          district: formData.district,
          state: formData.state,
          pincode: formData.pincode,
          latitude: latNum,
          longitude: lngNum,
          contactPhone: formData.contactPhone || null,
          capacity: capVal !== null && capVal >= 0 ? capVal : null,
          availabilityStatus: formData.availabilityStatus,
          operatingHours: formData.operatingHours || null,
          services: selectedServices,
          isActive: formData.isActive,
        });

        setActionSuccess('Facility record updated successfully.');
      }
    } catch (err: any) {
      console.error('Save facility error:', err);
      setError(err.message || 'Failed to save safe location.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleDeactivate = async () => {
    if (isNew || !locationId) return;
    setSubmitting(true);
    setError(null);
    try {
      if (formData.isActive) {
        if (!window.confirm('Are you sure you want to deactivate this facility?')) return;
        await deactivateSafeLocation(locationId);
        setFormData({ ...formData, isActive: false, availabilityStatus: 'CLOSED' });
        setActionSuccess('Facility marked inactive and closed.');
      } else {
        await reactivateSafeLocation(locationId);
        setFormData({ ...formData, isActive: true, availabilityStatus: 'AVAILABLE' });
        setActionSuccess('Facility reactivated and marked available.');
      }
    } catch (err: any) {
      console.error('Toggle active error:', err);
      setError(err.message || 'Failed to update activation status.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-semibold text-slate-500">Loading facility management page...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/admin/safe-locations"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Safe Locations Management</span>
        </Link>
        {!isNew && <span className="text-xs font-mono text-slate-400">Ref #{locationId}</span>}
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

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                {isNew ? 'Add New Safe Location' : 'Edit Safe Location Record'}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure evacuation capacity, services, contact details, and coordinates.
              </p>
            </div>
          </div>

          {!isNew && (
            <button
              type="button"
              onClick={handleToggleDeactivate}
              disabled={submitting}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-colors ${
                formData.isActive
                  ? 'bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 border-slate-300'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{formData.isActive ? 'Deactivate' : 'Reactivate'}</span>
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Facility Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Begumpet Disaster Relief Shelter"
              required
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Facility Type</label>
              <select
                name="locationType"
                value={formData.locationType}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                {Object.entries(LOCATION_TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Availability Status</label>
              <select
                name="availabilityStatus"
                value={formData.availabilityStatus}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="AVAILABLE">AVAILABLE - Accepting people</option>
                <option value="LIMITED">LIMITED - Restricted capacity</option>
                <option value="FULL">FULL - Maximum capacity</option>
                <option value="CLOSED">CLOSED - Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Facility Overview / Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Describe shelter facilities, emergency supplies, or entry requirements..."
              required
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Street / Area / House No."
              required
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Landmark</label>
              <input
                type="text"
                name="landmark"
                value={formData.landmark}
                onChange={handleChange}
                placeholder="e.g. Near Metro Station"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                {INDIAN_STATES_AND_UTS.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">PIN Code</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                maxLength={6}
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Latitude</label>
              <input
                type="text"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Longitude</label>
              <input
                type="text"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Capacity (Persons)</label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                placeholder="200"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="text"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Available Emergency Services</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {Object.entries(LOCATION_SERVICE_LABELS).map(([svcKey, svcLabel]) => {
                const key = svcKey as LocationService;
                const isSelected = selectedServices.includes(key);
                return (
                  <button
                    type="button"
                    key={key}
                    onClick={() => handleServiceToggle(key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold text-left border transition-colors ${
                      isSelected
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {svcLabel}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
            />
            <span>Active Public Listing</span>
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs sm:text-sm flex items-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? 'Saving...' : isNew ? 'Create Location' : 'Update Record'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
