
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
const RecentGeofences = ({ geofences }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Geofences</h2>
    <div className="space-y-3">
      {geofences.slice(0, 3).map((geofence) => (
        <div key={geofence.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium text-gray-900">{geofence.name}</p>
            <p className="text-sm text-gray-600">
              {geofence.UserGeofence.length} users • {geofence.radius}m radius
            </p>
          </div>
          <MapPin className="w-5 h-5 text-blue-500" />
        </div>
      ))}
    </div>
  </div>
);

export default RecentGeofences;