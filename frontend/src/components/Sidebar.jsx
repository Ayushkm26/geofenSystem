import React, { useState, useEffect } from 'react';
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
const Sidebar = ({ sidebarOpen, setSidebarOpen, activeSection, setActiveSection }) => {
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'geofences', label: 'Geofences', icon: MapPin },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'stats', label: 'Statistics', icon: TrendingUp },
    { id: 'create', label: 'Create Geofence', icon: Plus }
  ];

  return (
    <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white shadow-lg transition-all duration-300 flex flex-col`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {sidebarOpen && <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    activeSection === item.id
                      ? 'bg-blue-100 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {sidebarOpen && <span className="font-medium">{item.label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

    
    </div>
  );
};
export default Sidebar;
