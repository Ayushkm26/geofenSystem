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
import StatCard from './StatCard';

// Sidebar Component


// StatCard Component


// GeofenceCard Component


// Dashboard Overview Component


// Recent Geofences Component


// System Status Component

// Geofences Management Component


// Search Bar Component


// Users Management Component


// Statistics Component
const Statistics = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold text-gray-900">Statistics</h1>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatCard
        title="Geofence Coverage"
        value="87.2%"
        icon={Globe}
        change={3.1}
        color="green"
      />
      <StatCard
        title="Avg Users per Geofence"
        value="2.4"
        icon={Users}
        change={15.3}
        color="blue"
      />
      <StatCard
        title="System Uptime"
        value="99.8%"
        icon={Activity}
        change={0.2}
        color="purple"
      />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <GeofenceSizeDistribution />
      <ActivityTimeline />
    </div>
  </div>
);

// Geofence Size Distribution Component
const GeofenceSizeDistribution = () => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <h2 className="text-lg font-semibold text-gray-900 mb-4">Geofence Size Distribution</h2>
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-gray-600">Small (0-300m)</span>
        <div className="flex items-center gap-2">
          <div className="w-20 bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{width: '33%'}}></div>
          </div>
          <span className="text-sm text-gray-500">33%</span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-gray-600">Medium (300-600m)</span>
        <div className="flex items-center gap-2">
          <div className="w-20 bg-gray-200 rounded-full h-2">
            <div className="bg-green-600 h-2 rounded-full" style={{width: '42%'}}></div>
          </div>
          <span className="text-sm text-gray-500">42%</span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-gray-600">Large (600m+)</span>
        <div className="flex items-center gap-2">
          <div className="w-20 bg-gray-200 rounded-full h-2">
            <div className="bg-purple-600 h-2 rounded-full" style={{width: '25%'}}></div>
          </div>
          <span className="text-sm text-gray-500">25%</span>
        </div>
      </div>
    </div>
  </div>
);

// Activity Timeline Component
const ActivityTimeline = () => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity Timeline</h2>
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
        <div>
          <p className="text-sm font-medium text-gray-900">New geofence created</p>
          <p className="text-xs text-gray-500">2 hours ago</p>
        </div>
      </div>
      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
        <div>
          <p className="text-sm font-medium text-gray-900">User assigned to geofence</p>
          <p className="text-xs text-gray-500">4 hours ago</p>
        </div>
      </div>
      <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
        <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
        <div>
          <p className="text-sm font-medium text-gray-900">Geofence updated</p>
          <p className="text-xs text-gray-500">6 hours ago</p>
        </div>
      </div>
    </div>
  </div>
);
export default Statistics;