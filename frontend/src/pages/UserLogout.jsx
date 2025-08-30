import React, { useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Spinner } from '../components/Spinner';
import { toast } from 'react-toastify';

const UserLogout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const logoutUser = async () => {
      const token = localStorage.getItem("token");

      try {
        if (token) {
          // 🔑 Use POST (recommended) but keep GET if backend only accepts GET
          await axios.post(
            `${import.meta.env.VITE_BASE_URL}/api/users/logout`,
            {}, 
            {
              headers: { Authorization: `Bearer ${token}` },
            }// empty body
          );
        }
      } catch (error) {
        const errorMsg = error?.response?.data?.message;
        console.error("Logout failed:", errorMsg || error.message);

        if (errorMsg === "Token is blacklisted") {
          console.warn("Token was already blacklisted.");
        }
      } finally {
        // ✅ First clear token, then redirect
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("visitorId");

        toast.success("Logout successful!", { position: "bottom-center" });

        // Delay navigation slightly to let toast show & request finish
        setTimeout(() => {
          navigate("/userlogin");
        }, 300);
      }
    };

    logoutUser();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <Spinner />
    </div>
  );
};

export default UserLogout;
