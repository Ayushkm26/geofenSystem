import React from 'react'
import Headers from '../components/Headers';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Quote } from '../components/Quote';
import { toast } from 'react-toastify';
import { Spinner } from '../components/Spinner';
import axios from 'axios';
import { AdminDataContext } from '../Context/AdminContex'; // Importing AdminDataContext
import { useContext } from 'react';
import { useEffect } from 'react';
function AdminLoginPage() {

    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const navigate = useNavigate();
    const { admin, setAdmin } = useContext(AdminDataContext); // Using AdminDataContext to set admin data
    const [loading, setLoading] = useState(false); // spinner state
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // start spinner

        const newUser = {  email, password };

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BASE_URL}/api/admins/login`,
                newUser
            );

            if (response.status === 201) {
                const createdUser = response.data;
                const { id, email, name } = createdUser.admin;

                setAdmin({ id, email, name }); 
               
                localStorage.setItem("token", createdUser.access);
                setLoading(false);
                navigate("/admindashboard");
                toast.success("Admin account created successfully!", {
                    position: "bottom-center"
                });
            }
        } catch (error) {
            console.error("Error during signup:", error);
            toast.error("Signup failed. Please check your details and try again.", {
                position: "top-center"
            });
            setLoading(false); // stop spinner if failed
        }

        setEmail("");
        setPassword("");
        setName("");
    }; 
  if (loading) {
    // Spinner while redirecting
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }
  return (
    <div className="flex flex-col h-screen">
      <Headers type="signIn " />

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2">
        {/* Signup Form Section */}
        <div className="flex justify-center items-center px-6 bg-white">
          <div className="w-full max-w-md border border-gray-200 rounded-lg p-8 shadow-xl">
            <h1 className="text-3xl font-extrabold mb-8 text-center">
              Login As Admin    
            </h1>

            <div className="space-y-4">
              {/* Name */}
             

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border-0 text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-500 bg-gray-100"
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border-0 text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-500 bg-gray-100"
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                />
              </div>
            </div>

            {/* Centered Button and Link */}
            <div className="flex flex-col items-center mt-6">
              <button
                type="button"
                onClick={handleSubmit}
                className="px-6 py-3 bg-gray-800 text-white font-semibold rounded-lg shadow-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-300 w-full"
              >
                Login As Admin
              </button>

              <p className="mt-4 text-sm text-center">
                Dont have an account?
                <Link className="pl-2 underline text-blue-600" to={"/adminsignup"}>
                  SignUp
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Quote Section */}
        <div className="hidden lg:block bg-gray-50">
          <Quote />
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 bg-gray-800 text-gray-300 text-center">
        © {new Date().getFullYear()} GeoFence Tracker. All rights reserved.
      </footer>
    </div>
  )
}

export default AdminLoginPage