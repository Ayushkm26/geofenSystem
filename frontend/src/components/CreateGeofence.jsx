import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import { 
  MapPin, 
  Save, 
  X, 
  AlertCircle, 
  CheckCircle,
  Loader,
  Map,
  Plus,
  Minus,
  Target,
  Info
} from 'lucide-react';

const CreateGeofence = ({ isOpen, onClose, onSubmit }) => {
    const navigate = useNavigate();
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

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }

    if (!formData.longitude) {
      newErrors.longitude = 'Longitude is required';
    } else if (isNaN(formData.longitude) || formData.longitude < -180 || formData.longitude > 180) {
      newErrors.longitude = 'Longitude must be between -180 and 180';
    }

    if (!formData.latitude) {
      newErrors.latitude = 'Latitude is required';
    } else if (isNaN(formData.latitude) || formData.latitude < -90 || formData.latitude > 90) {
      newErrors.latitude = 'Latitude must be between -90 and 90';
    }

    if (!formData.radius || formData.radius < 10) {
      newErrors.radius = 'Radius must be at least 10 meters';
    } else if (formData.radius > 10000) {
      newErrors.radius = 'Radius cannot exceed 10,000 meters';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle coordinate input and update map
  const handleCoordinateChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (field === 'latitude' && formData.longitude && value) {
      const lat = parseFloat(value);
      const lng = parseFloat(formData.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        setSelectedLocation({ lat, lng });
      }
    } else if (field === 'longitude' && formData.latitude && value) {
      const lat = parseFloat(formData.latitude);
      const lng = parseFloat(value);
      if (!isNaN(lat) && !isNaN(lng)) {
        setSelectedLocation({ lat, lng });
      }
    }
  };

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData(prev => ({
            ...prev,
            latitude: latitude.toFixed(6),
            longitude: longitude.toFixed(6)
          }));
          setSelectedLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your current location. Please enter coordinates manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Create coordinates object for geofence
      const coordinates = {
        type: formData.type,
        coordinates: [parseFloat(formData.longitude), parseFloat(formData.latitude)],
        radius: parseFloat(formData.radius)
      };

      const geofenceData = {
        ...formData,
        longitude: parseFloat(formData.longitude),
        latitude: parseFloat(formData.latitude),
        radius: parseFloat(formData.radius),
        coordinates: JSON.stringify(coordinates)
      };

       const token = localStorage.getItem('token');
       if(!token) {
         console.error('No token found');
         navigate('/login');
         return;
       }
       const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/admins/addGeofence`, geofenceData, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
        });
        if (res.status === 201) {
          console.log('Geofence created successfully:', res.data);
        }
      
      setFormData({
        name: '',
        longitude: '',
        latitude: '',
        type: 'Circle',
        description: '',
        radius: 100,
        isActive: true
      });
      setSelectedLocation(null);
      onClose();
    } catch (error) {
      console.error('Error creating geofence:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="flex items-center gap-3">
            <MapPin className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Create New Geofence</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row h-full">
          {/* Form Section */}
          <div className="flex-1 p-6 overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-600" />
                    Basic Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Geofence Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.name ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter geofence name (e.g., Office Campus)"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.name}
                        </p>
                      )}
                    </div>

                  {/* Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Geofence Type
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Circle">Circle</option>
                      <option value="Polygon">Polygon</option>
                      <option value="Point">Point</option>
                    </select>
                  </div>

                  {/* Status */}
                  <div className="flex items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Active</span>
                    </label>
                  </div>
                </div>

                {/* Description */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Add a description for this geofence..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.description}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    {formData.description.length}/500 characters
                  </p>
                </div>
              </div>
              {/* Added closing tag for space-y-6 div */}
              </div>

              {/* Location Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" />
                  Location & Size
                </h3>

                {/* Get Current Location Button */}
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  className="mb-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
                >
                  <Target className="w-4 h-4" />
                  Use Current Location
                </button>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Latitude */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Latitude *
                    </label>
                    <input
                      type="number"
                      step="any"
                      name="latitude"
                      value={formData.latitude}
                      onChange={(e) => handleCoordinateChange('latitude', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.latitude ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="40.7128"
                    />
                    {errors.latitude && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.latitude}
                      </p>
                    )}
                  </div>

                  {/* Longitude */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Longitude *
                    </label>
                    <input
                      type="number"
                      step="any"
                      name="longitude"
                      value={formData.longitude}
                      onChange={(e) => handleCoordinateChange('longitude', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.longitude ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="-74.0060"
                    />
                    {errors.longitude && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.longitude}
                      </p>
                    )}
                  </div>

                  {/* Radius */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Radius (meters) *
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, radius: Math.max(10, prev.radius - 50) }))}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        name="radius"
                        min="10"
                        max="10000"
                        value={formData.radius}
                        onChange={handleInputChange}
                        className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center ${
                          errors.radius ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, radius: Math.min(10000, prev.radius + 50) }))}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    {errors.radius && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.radius}
                      </p>
                    )}
                  </div>
                </div>

                {/* Coordinates Preview */}
                {selectedLocation && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">Location Preview</h4>
                    <p className="text-sm text-blue-700">
                      Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                    </p>
                    <p className="text-sm text-blue-700">
                      Coverage Area: ~{Math.round(Math.PI * Math.pow(formData.radius, 2) / 10000)} hectares
                    </p>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Create Geofence
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

// Demo Component to show the CreateGeofence modal
const GeofenceDemo = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [geofences, setGeofences] = useState([]);

  const handleCreateGeofence = async (geofenceData) => {
    console.log('Creating geofence:', geofenceData);
    const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/admins/getGeofences`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }); 
    console.log
    if(response.data) {
      const newGeofence = {
        id: Date.now().toString(),
        ...geofenceData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      totalActiveUsers: 0,
      createdBy: 'admin-id'
    };  

    setGeofences(prev => [...prev, newGeofence]);
    alert('Geofence created successfully!');
  };
  }
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Geofence Management</h1>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Geofence
            </button>
          </div>

          {/* Geofences List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {geofences.map((geofence) => (
              <div key={geofence.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{geofence.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    geofence.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {geofence.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><strong>Type:</strong> {geofence.type}</p>
                  <p><strong>Location:</strong> {geofence.latitude}, {geofence.longitude}</p>
                  <p><strong>Radius:</strong> {geofence.radius}m</p>
                  {geofence.description && <p><strong>Description:</strong> {geofence.description}</p>}
                  <p><strong>Created:</strong> {new Date(geofence.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
            
            {geofences.length === 0 && (
              <div className="col-span-full text-center py-12">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No geofences created yet. Click "Create Geofence" to get started.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <CreateGeofence
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateGeofence}
      />
    </div>
  );
};

export default GeofenceDemo;
export { CreateGeofence };