// CreateGeofence.jsx
import React, { useState } from 'react';
import { useRef,useEffect } from 'react';
import { X, MapPin, Save, Loader, Plus, Minus, Target, AlertCircle, Info } from 'lucide-react';

const CreateGeofence = ({ isOpen, onClose, onCreate, socket }) => {
  const [formData, setFormData] = useState({
    name: '',
    longitude: '',
    latitude: '',
    type: 'Circle',
    description: '',
    radius: 100,
    isActive: true
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.longitude || isNaN(formData.longitude) || formData.longitude < -180 || formData.longitude > 180)
      newErrors.longitude = 'Longitude must be between -180 and 180';
    if (!formData.latitude || isNaN(formData.latitude) || formData.latitude < -90 || formData.latitude > 90)
      newErrors.latitude = 'Latitude must be between -90 and 90';
    if (!formData.radius || formData.radius < 10 || formData.radius > 10000) newErrors.radius = 'Radius must be 10-10000 meters';
    if (formData.description && formData.description.length > 500) newErrors.description = 'Description max 500 chars';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleCoordinateChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    const lat = parseFloat(field === 'latitude' ? value : formData.latitude);
    const lng = parseFloat(field === 'longitude' ? value : formData.longitude);
    if (!isNaN(lat) && !isNaN(lng)) setSelectedLocation({ lat, lng });
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) return alert('Geolocation not supported');
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        setFormData(prev => ({ ...prev, latitude: latitude.toFixed(6), longitude: longitude.toFixed(6) }));
        setSelectedLocation({ lat: latitude, lng: longitude });
      },
      err => alert('Unable to get location')
    );
  };

   const timeoutRef = useRef(null); // reference to fallback timeout

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!socket || socket.connected === false) return alert('Socket not connected');

    setIsSubmitting(true);

    const geofenceData = {
      ...formData,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude)
    };

    // Emit via socket
    socket.emit('add-geofence', geofenceData, (response) => {
      // Clear fallback timeout immediately
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      if (response?.error) {
        console.error('Socket error:', response.error);
        setIsSubmitting(false);
      } else {
        onCreate({ id: Date.now().toString(), ...geofenceData, createdAt: new Date().toISOString() });
        setFormData({ name: '', longitude: '', latitude: '', type: 'Circle', description: '', radius: 100, isActive: true });
        setSelectedLocation(null);
        setIsSubmitting(false);
        onClose();
      }
    });

    // Optional: fallback in case socket never responds
    timeoutRef.current = setTimeout(() => {
      setIsSubmitting(false);
      onClose();
    }, 5000);
  };

  // Clear timeout if modal closes manually
  useEffect(() => {
    if (!isOpen && timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, [isOpen]);


  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <MapPin className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Create New Geofence</h2>
          </div>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>

        {/* Scrollable Form */}
        <div className="p-6 overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
              <label className="block font-medium">Geofence Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full border p-2 rounded"
                placeholder="Office Campus"
              />
              {errors.name && <p className="text-red-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.name}</p>}

              <div className="flex gap-4 items-center">
                <select name="type" value={formData.type} onChange={handleInputChange} className="border p-2 rounded">
                  <option value="Circle">Circle</option>
                  <option value="Polygon">Polygon</option>
                  <option value="Point">Point</option>
                </select>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} />
                  Active
                </label>
              </div>

              <label>Description</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} className="w-full border p-2 rounded" />
            </div>

            {/* Location & Radius */}
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-gray-800">Location & Size</h3>
              </div>
              <button type="button" onClick={getCurrentLocation} className="mb-4 px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2">
                <Target className="w-4 h-4" /> Use Current Location
              </button>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label>Latitude *</label>
                  <input type="number" name="latitude" value={formData.latitude} onChange={(e) => handleCoordinateChange('latitude', e.target.value)} className="w-full border p-2 rounded" />
                  {errors.latitude && <p className="text-red-600">{errors.latitude}</p>}
                </div>
                <div>
                  <label>Longitude *</label>
                  <input type="number" name="longitude" value={formData.longitude} onChange={(e) => handleCoordinateChange('longitude', e.target.value)} className="w-full border p-2 rounded" />
                  {errors.longitude && <p className="text-red-600">{errors.longitude}</p>}
                </div>
                <div>
                  <label>Radius (meters) *</label>
                  <div className="flex gap-2 items-center">
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, radius: Math.max(10, prev.radius - 50) }))}><Minus /></button>
                    <input type="number" name="radius" value={formData.radius} onChange={handleInputChange} className="border p-2 rounded text-center" />
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, radius: Math.min(10000, prev.radius + 50) }))}><Plus /></button>
                  </div>
                  {errors.radius && <p className="text-red-600">{errors.radius}</p>}
                </div>
              </div>

              {selectedLocation && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-blue-700">Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}</p>
                  <p className="text-blue-700">Coverage Area: ~{Math.round(Math.PI * Math.pow(formData.radius, 2) / 10000)} hectares</p>
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button type="button" onClick={onClose} className="border px-4 py-2 rounded">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2">
                {isSubmitting ? <><Loader className="animate-spin w-4 h-4" /> Creating...</> : <><Save className="w-4 h-4" /> Create Geofence</>}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateGeofence;
