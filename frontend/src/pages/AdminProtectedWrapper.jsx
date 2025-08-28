import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminDataContext } from '../Context/AdminContex';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Spinner } from '../components/Spinner';

function AdminProtectedWrapper({ children, requireActive = true }) {
  const { setAdmin } = useContext(AdminDataContext);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
useEffect(() => {
  const verifyToken = async () => {
    if (!token) {
      navigate('/adminlogin', { replace: true });
      return;
    }

    try {
      // Choose endpoint based on requireActive
      const url = requireActive
        ? `${import.meta.env.VITE_BASE_URL}/api/admins/verify-token`
        : `${import.meta.env.VITE_BASE_URL}/api/admins/verify-token-lite`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.status === 200) {
        const { id, email, name, subscriptionEnd, isActive } = res.data.adminDetails;
        const expired = !subscriptionEnd || new Date(subscriptionEnd) < new Date();

        setAdmin({ id, email, name, subscriptionEnd, isActive });
        console.log("✅ Admin verified:", res.data.adminDetails);

        if (requireActive) {
          if (!isActive || expired) {
            toast.error("Your subscription is inactive or expired. Please renew.");
            navigate('/adminplanpayment', { replace: true });
            return;
          }
        } else {
          if (isActive && !expired) {
            toast.info("You already have an active subscription.");
            navigate('/admindashboard', { replace: true });
            return;
          }
        }
      }
    } catch (err) {
      console.error("❌ Token verification failed", err);

      if (axios.isAxiosError(err)) {
        if (err.response?.status === 403) {
          // subscription inactive → go to payment page
          navigate('/adminplanpayment', { replace: true });
          return;
        }
        if (err.response?.status === 401) {
          // invalid token → clear and go to login
          localStorage.removeItem("token");
          navigate('/adminlogin', { replace: true });
          return;
        }
      }

      localStorage.removeItem("token");
      navigate('/adminlogin', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  verifyToken();
}, [token, navigate, setAdmin, requireActive]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  return <>{children}</>;
}

export default AdminProtectedWrapper;
