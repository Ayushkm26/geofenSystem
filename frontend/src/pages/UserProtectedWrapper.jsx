import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserDataContext } from "../Context/UserContext";

import axios from 'axios';

const UserProtectedWrapper = ({ children }) => {
    const token = localStorage.getItem("token");
    const { user , setUser } = useContext(UserDataContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true); 

    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                navigate('/userlogin'); 
                return;
            }

            try {
                const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/users/verify-token`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setLoading(false);
                if (res.status === 200) {
                    const { id, email, name } = res.data.userDetails;
                    console.log("User details:", res.data.userDetails);
                    setUser({ id, email, name });

                    console.log("Token verified successfully", res.data);
                } else {
                    localStorage.removeItem("token"); // Clear invalid token
                    navigate('/userlogin'); // Redirect to login
                }
            } catch (err) {
                console.error("Token verification failed", err);
                localStorage.removeItem("token"); // Clear invalid token
                navigate('/userlogin'); // Redirect
            }
        };

        verifyToken();
    }, [token, navigate]);

    if (loading) return null; // Optional: add spinner if needed

    return <>{children}</>;
};

export default UserProtectedWrapper;
