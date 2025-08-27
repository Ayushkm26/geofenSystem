import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

import Headers from "../components/Headers";
import { Quote } from "../components/Quote";
import { Spinner } from "../components/Spinner";
import { AdminDataContext } from "../Context/AdminContex";
import OtpSection from "../components/OtpSection";

function AdminSignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);

  const { setAdmin } = useContext(AdminDataContext);
  const navigate = useNavigate();

  // Handle Admin Signup
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/admins/register`,
        { name, email, password }
      );

      if (response.status === 201) {
        toast.success("OTP sent to your email!", { position: "bottom-center" });
        setShowOtp(true); // show OTP popup
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Signup failed. Please try again.", { position: "top-center" });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <Headers type="signUp" />

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2">
        {/* Signup Form */}
        <div className="flex justify-center items-center px-6 bg-white">
          <div className="w-full max-w-md border border-gray-200 rounded-lg p-8 shadow-xl">
            <h1 className="text-3xl font-extrabold mb-8 text-center">
              Create an account as Admin
            </h1>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  UserName
                </label>
                <input
                  type="text"
                  placeholder="Enter your UserName"
                  className="w-full px-4 py-3 bg-gray-100 border-0 text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-500"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 bg-gray-100 border-0 text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 bg-gray-100 border-0 text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full px-6 py-3 bg-gray-800 text-white font-semibold rounded-lg shadow-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-300"
              >
                Create Account
              </button>
            </form>

            <p className="mt-4 text-sm text-center">
              Already have an account?
              <Link className="pl-2 underline text-blue-600" to="/adminlogin">
                Login
              </Link>
            </p>
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

      {/* OTP Section */}
      {showOtp && (
        <OtpSection
          type="admin"
          email={email}
          onClose={() => setShowOtp(false)}
          onVerified={({ admin, access }) => {
            setAdmin(admin); // save admin in context
            localStorage.setItem("token", access);
            toast.success("Account verified successfully!", {
              position: "bottom-center",
            });
            setShowOtp(false);
            navigate("/admindashboard");
          }}
        />
      )}
    </div>
  );
}

export default AdminSignupPage;
