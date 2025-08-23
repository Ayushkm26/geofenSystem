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
import AdminGeofenceCard from './AdminGeofenceCard';

const GeofencesManagement = ({ geofences, searchTerm, setSearchTerm, onAdd, onEdit, onDelete }) => {
  const filteredGeofences = geofences.filter(geofence =>
    geofence.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Geofences Management</h1>
        <button 
          onClick={onAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Geofence
        </button>
      </div>

      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} placeholder="Search geofences..." />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGeofences.map((geofence) => (
          <AdminGeofenceCard
            key={geofence.id}
            geofence={geofence}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};
const SearchBar = ({ searchTerm, setSearchTerm, placeholder }) => (
  <div className="relative flex-1 max-w-md">
    <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
    <input
      type="text"
      placeholder={placeholder}
      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  </div>
);
export default GeofencesManagement;