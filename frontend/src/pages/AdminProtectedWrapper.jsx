import React from 'react'
import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AdminDataContext } from '../Context/AdminContex'; // Importing AdminDataContext
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import axios from 'axios';
import { Spinner } from '../components/Spinner';
import { useState } from 'react';
function AdminProtectedWrapper({ children }) {
  const { admin, setAdmin } = useContext(AdminDataContext);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true); // spinner state

 
  useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                navigate('/adminlogin'); 
                return;
            }
            try {
                const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/admins/verify-token`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setLoading(false);
                if (res.status === 200) {
                    const { id, email, name } = res.data.adminDetails;
                    console.log("Admin details:", res.data.adminDetails);
                    setAdmin({ id, email, name });

                    console.log("Token verified successfully", res.data);
                } else {
                    localStorage.removeItem("token"); // Clear invalid token
                    navigate('/adminlogin'); // Redirect to login
                }
            } catch (err) {
                console.error("Token verification failed", err);
                localStorage.removeItem("token"); // Clear invalid token
                navigate('/adminlogin'); // Redirect
            }
        };
        verifyToken();
    }, [token, navigate]);
    if(loading) return (
        <div className="flex items-center justify-center h-screen"> 
            <Spinner />
        </div>
    );

  return <>{children}</>;
}

export default AdminProtectedWrapper
