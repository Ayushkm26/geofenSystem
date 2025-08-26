import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './pages/HomePage';
import UserLoginPage from './pages/UserLoginPage';
import UserSignupPage from './pages/UserSignupPage';
import Dashboard from './pages/Dashboard';
import UserProtectedWrapper from './pages/UserProtectedWrapper';
import UserLogout from './pages/UserLogout';
import LocationHistory from './pages/LocationHistory';
import { useState } from 'react';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminSignupPage from './pages/AdminSignupPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminProtectedWrapper from './pages/AdminProtectedWrapper';
import AdminLogout from './pages/AdminLogout';
import OtpSection from './components/OtpSection';
function App() {

  return (
  
   <>
   <Routes>
     <Route path="/" element={<Homepage />} />
     <Route path="/userlogin" element={<UserLoginPage />} />
     <Route path="/usersignup" element={<UserSignupPage />} />
     <Route path="/userdashboard" element={<UserProtectedWrapper><Dashboard/></UserProtectedWrapper>} />
      <Route path="/userlogout" element={<UserProtectedWrapper><UserLogout /></UserProtectedWrapper>} />
      <Route path="/locationhistory" element={<UserProtectedWrapper><LocationHistory /></UserProtectedWrapper>} />
      <Route path="/adminlogin" element={<AdminLoginPage />} />
      <Route path="/adminsignup" element={<AdminSignupPage />} />
      <Route path="/admindashboard" element={<AdminProtectedWrapper><AdminDashboard /></AdminProtectedWrapper>} />
      <Route path="/adminlogout" element={<AdminProtectedWrapper><AdminLogout /></AdminProtectedWrapper>} />
   </Routes>
   </>
  )
}

export default App
