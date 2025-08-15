import React from 'react'
import DashboardHeader from '../components/DashboardHeader';
import Footer from '../components/Footers';
function Dashboard() {
  return (
    <div>
      <DashboardHeader type="dashboard" />
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold">Welcome to the Dashboard</h1>
        <p className="mt-4 text-gray-600">This is your dashboard where you can manage your account and settings.</p>
      </div>    
      <Footer />
    </div>
  )
}

export default Dashboard