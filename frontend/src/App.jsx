import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './pages/HomePage';
import UserLoginPage from './pages/UserLoginPage';
import UserSignupPage from './pages/UserSignupPage';
import Dashboard from './pages/Dashboard';
import UserProtectedWrapper from './pages/UserProtectedWrapper';
import Logout from './pages/UserLogout';
function App() {
  

  return (
  
   <>
   <Routes>
     <Route path="/" element={<Homepage />} />
     <Route path="/userlogin" element={<UserLoginPage />} />
     <Route path="/usersignup" element={<UserSignupPage />} />
     <Route path="/userdashboard" element={<UserProtectedWrapper><Dashboard /></UserProtectedWrapper>} />
      <Route path="/userlogout" element={<UserProtectedWrapper><Logout /></UserProtectedWrapper>} />
   </Routes>
   </>
  )
}

export default App
