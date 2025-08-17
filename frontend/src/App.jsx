import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './pages/HomePage';
import UserLoginPage from './pages/UserLoginPage';
import UserSignupPage from './pages/UserSignupPage';
import Dashboard from './pages/Dashboard';
import UserProtectedWrapper from './pages/UserProtectedWrapper';
import Logout from './pages/UserLogout';
import LocationHistory from './pages/LocationHistory';
import { useState } from 'react';
function App() {
    const [isShared, setIsShared] = useState(false);

  return (
  
   <>
   <Routes>
     <Route path="/" element={<Homepage />} />
     <Route path="/userlogin" element={<UserLoginPage />} />
     <Route path="/usersignup" element={<UserSignupPage />} />
     <Route path="/userdashboard" element={<UserProtectedWrapper><Dashboard isShared={isShared} setIsShared={setIsShared} /></UserProtectedWrapper>} />
      <Route path="/userlogout" element={<UserProtectedWrapper><Logout /></UserProtectedWrapper>} />
      <Route path="/locationhistory" element={<UserProtectedWrapper><LocationHistory /></UserProtectedWrapper>} />
   </Routes>
   </>
  )
}

export default App
