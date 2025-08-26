// AdminDashboard.jsxFree
import AdminHeader from '../components/AdminHeader';
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import DashboardOverview from '../components/DashboardOverview';
import GeofencesManagement from '../components/GeofenceManagement';
import UsersManagement from '../components/UserManagement';
import Statistics from '../components/Statistics';
import CreateGeofence from '../components/CreateGeofence';
import { io } from 'socket.io-client';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const SOCKET_URL = `${import.meta.env.VITE_BASE_URL}/admin`;

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [geofences, setGeofences] = useState([]);
  const [dashboardData, setDashboardData] = useState({
    totalGeofences: 0,
    activeUsers: 0,
    totalAdmins: 1,
    recentActivities: 0,
  });
  const [socket, setSocket] = useState(null);
  const [socketStatus, setSocketStatus] = useState('disconnected');

  // Initialize socket connection
  useEffect(() => {
    if (!SOCKET_URL) {
      console.error('SOCKET_URL is not defined!');
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      console.error('No token found!');
      return;
    }
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket'],
      path: '/api/socket.io',
      auth: { token },
      timeout: 20000, // 20 seconds
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    setSocket(newSocket);

    // Connection events
    newSocket.on('connect', () => {
      console.log('Connected to Admin Socket:', newSocket.id);
      setSocketStatus('connected');
      newSocket.emit('get-geofences'); // fetch initial geofences
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connect_error:', err);
      setSocketStatus('error');
    });

    newSocket.on('connect_timeout', () => {
      console.warn('Socket connect_timeout');
      setSocketStatus('timeout');
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setSocketStatus('disconnected');
    });

    // Geofence events
    newSocket.on('geofences-list', (list) => {
      console.log('Received geofences:', list);
      setGeofences(list);
      setDashboardData((prev) => ({ ...prev, totalGeofences: list.length, activeUsers: list.reduce((acc, g) => acc + (g.UserGeofence?.length || 0), 0) }));
    });

  newSocket.on('geofence-added', (newGeofence) => {
  setGeofences((prev) => [...prev, newGeofence]);
  setDashboardData((prev) => ({ ...prev, totalGeofences: prev.totalGeofences + 1 }));
});
newSocket.on("user-geofence-event", (data) => {
  console.log("User Geofence Event:", data);
   newSocket.emit("get-geofences");

  // Show toast notification
  toast.info(
    `${data.userEmail || data.userId} ${data.event} ${data.geofenceName}`,
    { position: "top-right" }
  );
  
});
newSocket.on('outside-geofence', (data) => {
  console.log("User outside fence:", data);
  newSocket.emit("get-geofences");
  toast.warn(
    `${data.userEmail || data.userId} is outside the geofence ${data.geofenceName}`,
    { position: "top-right" }
  );
});

newSocket.on('geofence-updated', (updatedGeofence) => {
  console.log('Geofence updated:', updatedGeofence);
  setGeofences((prev) =>
    prev.map((g) => (g.id === updatedGeofence.id ? updatedGeofence : g))
  );
});

newSocket.on('geofence-deleted', (deletedId) => {
  console.log('Geofence deleted:', deletedId);
  setGeofences((prev) => prev.filter((g) => g.id !== deletedId));
  setDashboardData((prev) => ({ ...prev, totalGeofences: prev.totalGeofences - 1 }));
});

    newSocket.on('error', (err) => {
      console.error('Socket error:', err);
    });

    return () => newSocket.disconnect();
  }, []);

  // CRUD handlers
  const handleAddGeofence = () => setIsCreateModalOpen(true);

  const handleCreateGeofence = (newGeofence) => {
    if (!socket || socketStatus !== 'connected') return console.error('Socket not connected');
    socket.emit('add-geofence', newGeofence);
    setIsCreateModalOpen(false);
  };

  const handleEditGeofence = (updatedGeofence) => {
    if (!socket || socketStatus !== 'connected') return console.error('Socket not connected');
    socket.emit('update-geofence', updatedGeofence);
  };

  const handleDeleteGeofence = (geofenceId) => {
    if (!socket || socketStatus !== 'connected') return console.error('Socket not connected');
    socket.emit('delete-geofence', geofenceId);
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
      default:
        return <DashboardOverview dashboardData={dashboardData} geofences={geofences} />;
    }
  };

  return (
    <>
      <AdminHeader />
      <div className="flex h-screen bg-gray-100">
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />
        <div className="flex-1 overflow-auto p-6">
          {renderContent()}
          <div className="mt-4 text-sm text-gray-500">
            Socket Status: <span>{socketStatus}</span>
          </div>
        </div>
      </div>

      {isCreateModalOpen && (
        <CreateGeofence
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateGeofence}
          socket={socket}
        />
      )}
      <ToastContainer position="top-right" autoClose={3000} />

    </>
    
  );
};

export default AdminDashboard;
