import React, { useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Spinner } from '../components/Spinner';
import { toast } from 'react-toastify';

function AdminLogout() {
  const navigate = useNavigate();

  useEffect(() => {
    const logoutAdmin = async () => {
      const token = localStorage.getItem('token');

      try {
        if (token) {
          await axios.post(
            `${import.meta.env.VITE_BASE_URL}/api/admins/logout`,
            {}, // ✅ empty body
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        }
      } catch (error) {
        const errorMsg = error?.response?.data?.message;
        console.error("Logout failed:", errorMsg || error.message);

        if (errorMsg === "Token is blacklisted") {
          console.warn("Token was already blacklisted.");
        }
      } finally {
        localStorage.clear();
        navigate('/adminlogin');
        toast.success("Logout successful!", {
          position: "bottom-center",
        });
      }
    };

    logoutAdmin();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <Spinner />
    </div>
  );
}

export default AdminLogout;
