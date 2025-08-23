import AdminHeader from '../components/AdminHeader';
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import DashboardOverview from '../components/DashboardOverview';
import GeofencesManagement from '../components/GeofenceManagement';
import UsersManagement from '../components/UserManagement';
import Statistics from '../components/Statistics';
import CreateGeofence from '../components/CreateGeofence';




// Main Admin Dashboard Component
const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - replace with API calls
  const [dashboardData, setDashboardData] = useState({
    totalGeofences: 12,
    activeUsers: 48,
    totalAdmins: 3,
    recentActivities: 15
    
  });

  const [geofences, setGeofences] = useState([
    {
      id: '1',
      name: 'Office Campus',
      latitude: 40.7128,
      longitude: -74.0060,
      radius: 500,
      type: 'Point',
      createdAt: '2024-01-15',
      UserGeofence: [
        { id: '1', userId: 'u1', user: { id: 'u1', name: 'John Doe', email: 'john@example.com' }},
        { id: '2', userId: 'u2', user: { id: 'u2', name: 'Jane Smith', email: 'jane@example.com' }}
      ]
    },
    {
      id: '2',
      name: 'Warehouse District',
      latitude: 40.7589,
      longitude: -73.9851,
      radius: 750,
      type: 'Point',
      createdAt: '2024-01-20',
      UserGeofence: [
        { id: '3', userId: 'u3', user: { id: 'u3', name: 'Mike Johnson', email: 'mike@example.com' }}
      ]
    },
    {
      id: '3',
      name: 'Retail Zone',
      latitude: 40.7505,
      longitude: -73.9934,
      radius: 300,
      type: 'Point',
      createdAt: '2024-02-01',
      UserGeofence: []
    }
  ]);

  // Event handlers
  const handleAddGeofence = () => {
    console.log('Add geofence clicked');
    // Implement add geofence logic
  };

  const handleEditGeofence = (geofence) => {
    console.log('Edit geofence:', geofence);
    // Implement edit geofence logic
  };

  const handleDeleteGeofence = (geofenceId) => {
    console.log('Delete geofence:', geofenceId);
    // Implement delete geofence logic
    setGeofences(prev => prev.filter(g => g.id !== geofenceId));
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardOverview dashboardData={dashboardData} geofences={geofences} />;
      case 'geofences':
        return (
          <GeofencesManagement 
            geofences={geofences}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onAdd={handleAddGeofence}
            onEdit={handleEditGeofence}
            onDelete={handleDeleteGeofence}
          />
        );
      case 'users':
        return <UsersManagement geofences={geofences} />;
      case 'stats':
        return <Statistics />;
      case 'create':
        return <CreateGeofence />;
      default:
        return <DashboardOverview dashboardData={dashboardData} geofences={geofences} />;
    }
  };

  return (
    <>
    <AdminHeader />
    <div className="flex h-screen bg-gray-100 border-1">
      <Sidebar 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
      
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-4 px-6">
        <p className="text-center text-gray-500 text-sm">
          &copy; 2024 Geofence Management. All rights reserved.
        </p>
      </div>
    </footer>
    </>
  );
};

export default AdminDashboard;