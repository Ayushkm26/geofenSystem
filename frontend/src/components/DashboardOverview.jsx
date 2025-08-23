import React from 'react';  
import StatCard from './StatCard';
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
import RecentGeofences from './RecentGeofences';
const DashboardOverview = ({ dashboardData, geofences }) => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Geofences"
        value={dashboardData.totalGeofences}
        icon={MapPin}
        change={8.2}
        color="blue"
      />
      <StatCard
        title="Active Users"
        value={dashboardData.activeUsers}
        icon={Users}
        change={12.5}
        color="green"
      />
      <StatCard
        title="Total Admins"
        value={dashboardData.totalAdmins}
        icon={Settings}
        change={0}
        color="purple"
      />
      <StatCard
        title="Recent Activities"
        value={dashboardData.recentActivities}
        icon={Activity}
        change={-2.1}
        color="orange"
      />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <RecentGeofences geofences={geofences} />
     
  <div className="bg-white rounded-lg shadow-md p-6">
    <h2 className="text-lg font-semibold text-gray-900 mb-4">System Status</h2>
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-gray-600">API Status</span>
        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">Online</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-gray-600">Database</span>
        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">Connected</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-gray-600">Last Backup</span>
        <span className="text-sm text-gray-500">2 hours ago</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-gray-600">Server Load</span>
        <span className="text-sm text-gray-500">23%</span>
      </div>
    </div>
  </div>

    </div>
  </div>
);
export default DashboardOverview;