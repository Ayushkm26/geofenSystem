import { 
  Users, 
  MapPin, 
  BarChart3, 
  Settings, 
  LogOut, 
  Plus,
  Trash2,
  Edit,
  Search,
  Menu,
  X,
  TrendingUp,
  Activity,
  Globe
} from 'lucide-react';

// Sidebar Component


// StatCard Component


// GeofenceCard Component
const AdminGeofenceCard = ({ geofence, onEdit, onDelete }) => (
  <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{geofence.name}</h3>
        <p className="text-gray-600 text-sm">Created: {new Date(geofence.createdAt).toLocaleDateString()}</p>
      </div>
      <div className="flex gap-2">
        <button 
          onClick={() => onEdit(geofence)}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button 
          onClick={() => onDelete(geofence.id)}
          className="p-2 text-red-600 hover:bg-red-50 rounded"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
    
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div>
        <p className="text-sm text-gray-600">Latitude</p>
        <p className="font-medium">{geofence.latitude}</p>
      </div>
      <div>
        <p className="text-sm text-gray-600">Longitude</p>
        <p className="font-medium">{geofence.longitude}</p>
      </div>
      <div>
        <p className="text-sm text-gray-600">Radius</p>
        <p className="font-medium">{geofence.radius}m</p>
      </div>
      <div>
        <p className="text-sm text-gray-600">Active Users</p>
        <p className="font-medium">{geofence.UserGeofence.length}</p>
      </div>
    </div>

    {geofence.UserGeofence.length > 0 && (
      <div>
        <p className="text-sm text-gray-600 mb-2">Assigned Users:</p>
        <div className="flex flex-wrap gap-2">
          {geofence.UserGeofence.slice(0, 3).map((userGeo) => (
            <span key={userGeo.id} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
              {userGeo.user.name}
            </span>
          ))}
          {geofence.UserGeofence.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
              +{geofence.UserGeofence.length - 3} more
            </span>
          )}
        </div>
      </div>
    )}
  </div>
);
export default AdminGeofenceCard;