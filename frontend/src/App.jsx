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
import AdminPlanPayment from './pages/AdminPlanPayment';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import ContactUs from './components/ContactUs';
import AboutPage from './pages/AboutPage';
import PageNotFound from './components/PageNotFound';
import ChatUI from './components/ChatUI';
import { AdminDataContext } from "./Context/AdminContex";
import { useContext } from 'react';
import { UserDataContext } from './Context/UserContext';
import UserResyncPage from './pages/UserResynncPage';
import AdminPageResync from './pages/AdminPageResync';
import GeoFencingHelpPage from "./pages/GeoFencingHelpPage";
import UserChatPage from './pages/UserChatPage';
import AdminChatPage from './pages/AdminChatPage';
function App() {
  const { user } = useContext(UserDataContext);
  return (
    <>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/userlogin" element={<UserLoginPage />} />
        <Route path="/usersignup" element={<UserSignupPage />} />
        <Route path="/userdashboard" element={<UserProtectedWrapper><Dashboard/></UserProtectedWrapper>} />
        <Route path="/userresync" element={<UserProtectedWrapper><UserResyncPage /></UserProtectedWrapper>} />
        <Route path="/userlogout" element={<UserProtectedWrapper><UserLogout /></UserProtectedWrapper>} />
        <Route path="/locationhistory" element={<UserProtectedWrapper><LocationHistory /></UserProtectedWrapper>} />
        <Route path="/adminlogin" element={<AdminLoginPage />} />
        <Route path="/adminsignup" element={<AdminSignupPage />} />
        <Route 
          path="/adminplanpayment" 
          element={
            <AdminProtectedWrapper requireActive={false}>
              <AdminPlanPayment />
            </AdminProtectedWrapper>
          } 
        />  
        <Route 
          path="/admindashboard" 
          element={
            <AdminProtectedWrapper requireActive={true}>
              <AdminDashboard />
            </AdminProtectedWrapper>
          } 
        />  
         <Route 
          path="/adminresync" 
          element={
            <AdminProtectedWrapper requireActive={true}>
              <AdminPageResync />
            </AdminProtectedWrapper>
          } 
        />  
           <Route 
          path="/adminchat" 
          element={
            <AdminProtectedWrapper requireActive={true}>
              <AdminChatPage />
            </AdminProtectedWrapper>
          } 
        />  
          <Route 
          path="/userchat" 
          element={
            
            <UserProtectedWrapper requireActive={true}>
              <UserChatPage />
            </UserProtectedWrapper>
          } 
        />
        <Route path="/adminlogout" element={<AdminLogout />} />
        <Route path='/privacy-policy' element={<PrivacyPolicyPage />} />
        <Route path='/contact-us' element={<ContactUs />} />
        <Route path='/about' element={<AboutPage />} />
        <Route path='/help' element={<GeoFencingHelpPage />} />
        {/* 404 Page Not Found Route */}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </>
  )
}

export default App
