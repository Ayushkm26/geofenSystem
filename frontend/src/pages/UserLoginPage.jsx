import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Quote } from "../components/Quote";
import Header from "../components/Headers";
import Footer from "../components/Footers";
import { UserDataContext } from "../Context/UserContext";
import axios from "axios";
import { Spinner } from "../components/Spinner";
import { toast } from 'react-toastify';

function UserLoginPage() {
  const navigate = useNavigate();
  const { setUser } = useContext(UserDataContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // spinner state

  const handleEmailChange = (e) => setEmail(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // start spinner

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/users/login`,
        { email, password }
      );

      if (response.status === 200) {
        const loggedInUser = response.data;
        const { id, email: userEmail, name } = loggedInUser.user;

        setUser({ id, email: userEmail, name });
        localStorage.setItem("token", loggedInUser.access);

        setEmail("");
        setPassword("");

        navigate("/userdashboard");
        toast.success("Login successful!", {
         position: "bottom-center"
       });

      }
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Login failed. Please check your credentials and try again.", {
        position: "top-center"
      });
      setLoading(false); // stop spinner on failure
    }
  };

  if (loading) {
    // Spinner while logging in
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <Header type="signin" />

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2">
        {/* Login Form Section */}
        <div className="flex justify-center items-center px-6 bg-white">
          <div className="w-full max-w-md border border-gray-200 rounded-lg p-8 shadow-xl">
            <h1 className="text-3xl font-extrabold mb-8 text-center">
              Login to your account
            </h1>

            <div className="space-y-4">
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
                  onChange={handleEmailChange}
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
                  onChange={handlePasswordChange}
                  value={password}
                />
              </div>
            </div>

            {/* Button and Link */}
            <div className="flex flex-col items-center mt-6">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!email || !password}
                className="px-6 py-3 bg-gray-800 text-white font-semibold rounded-lg shadow-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-300 w-full"
              >
                Login Account
              </button>

              <p className="mt-4 text-sm text-center">
                Don't have an account?
                <Link
                  className="pl-2 underline text-blue-600"
                  to={"/usersignup"}
                >
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
      
    </div>
  );
}

export default UserLoginPage;
