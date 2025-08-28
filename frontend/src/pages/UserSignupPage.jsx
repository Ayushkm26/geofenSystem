import React, { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import FeaturesShowcase from "../components/FeaturesShowcase";
import Header from "../components/Headers";
import Footer from "../components/Footers";
import { UserDataContext } from "../Context/UserContext";
import axios from "axios";
import { Spinner } from "../components/Spinner";
import { toast } from "react-toastify";
import OtpSection from "../components/OtpSection";

export default function UserSignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false); // spinner state
  const [showOtp, setShowOtp] = useState(false); // ✅ controls OTP popup
  const { setUser } = useContext(UserDataContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const newUser = { name, email, password };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/users/register`,
        newUser
      );

      if (response.status === 201) {
        setLoading(false);
        setShowOtp(true); // ✅ show OTP popup
        toast.success("OTP sent!", { position: "bottom-center" });
      }
    } catch (error) {
      console.error("Error during signup:", error);
      toast.error("Signup failed. Please check your details and try again.", {
        position: "top-center",
      });
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
      {/* Header */}
      <Header type="signUp" />

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2">
        {/* Signup Form Section */}
        <div className="flex justify-center items-center px-6 bg-white">
          <div className="w-full max-w-md border border-gray-200 rounded-lg p-8 shadow-xl">
            <h1 className="text-3xl font-extrabold mb-8 text-center">
              Create an account
            </h1>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 border-0 text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-500 bg-gray-100"
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                />
              </div>

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

            {/* Submit Button + Login Link */}
            <div className="flex flex-col items-center mt-6">
              <button
                type="button"
                onClick={handleSubmit}
                className="px-6 py-3 bg-gray-800 text-white font-semibold rounded-lg shadow-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-300 w-full"
              >
                Create Account
              </button>

              <p className="mt-4 text-sm text-center">
                Already have an account?
                <Link
                  className="pl-2 underline text-blue-600"
                  to={"/userlogin"}
                >
                  Login
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Quote Section */}
        <div className="hidden lg:block bg-gray-50">
          <FeaturesShowcase />
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* ✅ OTP Popup Modal */}
    {showOtp && (
  <OtpSection
    email={email}
    onClose={() => setShowOtp(false)}
    onVerified={({ user, access }) => {
      // ✅ set user after OTP success
      setUser(user);
      localStorage.setItem("token", access);

      setShowOtp(false);
      navigate("/userdashboard");
    }}
  />
)}
    </div>
  );
}
