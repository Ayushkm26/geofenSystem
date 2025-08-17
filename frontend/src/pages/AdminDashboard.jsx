import React from 'react'
import { Link } from 'react-router-dom';
import Headers from '../components/Headers';
import { useContext } from 'react';
import { AdminDataContext } from '../Context/AdminContex'; // Importing AdminDataContext

function AdminDashboard() {
  const { admin } = useContext(AdminDataContext); // Accessing admin data from context

  return (
    <><h1>Admin Dashboard</h1>
    <p>Welcome to the admin dashboard. Here you can manage users, view reports, and configure settings.</p>
    <div className="admin-info">
      <h2>Admin Information</h2>
      <p><strong>Name:</strong> {admin.name}</p>
      <p><strong>Email:</strong> {admin.email}</p>
    </div>
    </>
  )
}

export default AdminDashboard