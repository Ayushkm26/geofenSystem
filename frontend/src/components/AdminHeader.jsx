import React, { useState, useRef, useEffect, useContext, use } from "react";
import { AdminDataContext } from "../Context/AdminContex";
import { useNavigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode";
const AdminHeader = () => {
  const { admin } = useContext(AdminDataContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSubscriptionDate, setActiveSubscriptionDate] = useState("Free plan");
  // Separate refs for desktop and mobile dropdowns
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log("Decoded token:", decoded);
        console.log(decoded.subscriptionEnd);
        // decoded contains whatever you signed in your backend
        // e.g. { sub, role, email, isActive, subscriptionStart, subscriptionEnd }
        if (decoded.subscriptionEnd) {
          const endDate = new Date(decoded.subscriptionEnd);
          setActiveSubscriptionDate(` Valid till: ${endDate.toDateString()}`);
        } else {
          setActiveSubscriptionDate("Free plan");
        }
      } catch (err) {
        console.error("Invalid token:", err);
        setActiveSubscriptionDate("Free plan");
      }
    }
  }, [admin]);  
  const desktopDropdownRef = useRef(null);
  const mobileDropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check both desktop and mobile dropdown refs
      if (
        (desktopDropdownRef.current && !desktopDropdownRef.current.contains(event.target)) &&
        (mobileDropdownRef.current && !mobileDropdownRef.current.contains(event.target))
      ) {
        setDropdownOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle logout with proper cleanup
  const handleLogout = () => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate("/adminlogout");
  };

  // Handle navigation with cleanup
  const handleNavigation = (path) => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate(path);
  };

  return (
    <header>
      <nav className="bg-gray-100 px-4 lg:px-6 py-2.5 w-full border-b border-green-400">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <button
            onClick={() => handleNavigation("/admindashboard")}
            className="flex items-center space-x-2 focus:outline-none"
          >
            <img
              src="https://imgs.search.brave.com/YVLjeEqEj-qfq78AiKd_8whXU8n29tC8dR6_cdfqhZ4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wMjcv/MTc5LzQwMC9zbWFs/bC9sb2NhdGlvbi1t/YXAtYWRkcmVzcy1p/Y29uLXN5bWJvbC1m/cmVlLXBuZy5wbmc"
              className="h-10 w-auto"
              alt="Logo"
            />
            <span className="text-xl font-semibold text-gray-800">
              GeoFence System
            </span>
          </button>

          {/* Desktop */}
          <div className="hidden sm:flex items-center space-x-4 ">
           <p
  className={`border rounded-lg px-4 py-2 font-bold text-lg 
    ${
      activeSubscriptionDate === "Free plan"
        ? "bg-gray-200 border-gray-400 text-gray-800"
        : "bg-green-500 border-green-600 text-white"
    }`}
>
  {activeSubscriptionDate}
</p>
            <div ref={desktopDropdownRef} className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center justify-center h-10 w-10 text-lg bg-white font-bold text-black rounded-full focus:outline-none hover:bg-gray-50 transition-colors"
              >
                {admin?.name ? admin.name.charAt(0).toUpperCase() : "A"}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white divide-y divide-gray-100 rounded-lg shadow-lg border z-50">
                  <div className="px-4 py-3 text-sm text-gray-900">
                    <div className="font-semibold">{admin?.name || "Admin"}</div>
                    <div className="truncate text-gray-500">{admin?.email || "admin@example.com"}</div>
                  </div>
                  <ul className="py-2 text-sm text-gray-700">
                    <li>
                      <button
                        onClick={() => handleNavigation("/admindashboard")}
                        className="block w-full text-left px-4 py-2 font-medium hover:bg-gray-100 transition-colors"
                      >
                        Message Users
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleNavigation("/resync")}
                        className="block w-full text-left px-4 py-2 font-medium hover:bg-gray-100 transition-colors"
                      >
                        Resync Data
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleNavigation("/help")}
                        className="block w-full text-left px-4 py-2 font-medium hover:bg-gray-100 transition-colors"
                      >
                        Help
                      </button>
                    </li>
                  </ul>
                  <div className="py-2">
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile */}
          <div className="sm:hidden flex items-center space-x-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-800 focus:outline-none text-2xl hover:text-gray-600 transition-colors"
            >
              ☰
            </button>
            <div ref={mobileDropdownRef} className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center justify-center h-10 w-10 text-lg bg-white font-bold text-black rounded-full focus:outline-none hover:bg-gray-50 transition-colors"
              >
                {admin?.name ? admin.name.charAt(0).toUpperCase() : "A"}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white divide-y divide-gray-100 rounded-lg shadow-lg border z-50">
                  <div className="px-4 py-3 text-sm text-gray-900">
                    <div className="font-semibold">{admin?.name || "Admin"}</div>
                    <div className="truncate text-gray-500">{admin?.email || "admin@example.com"}</div>
                  </div>
                  <ul className="py-2 text-sm text-gray-700">
                    <li>
                      <button
                        onClick={() => handleNavigation("/admindashboard")}
                        className="block w-full text-left px-4 py-2 font-medium hover:bg-gray-100 transition-colors"
                      >
                        Message Users
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleNavigation("/resync")}
                        className="block w-full text-left px-4 py-2 font-medium hover:bg-gray-100 transition-colors"
                      >
                        Resync Data
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleNavigation("/help")}
                        className="block w-full text-left px-4 py-2 font-medium hover:bg-gray-100 transition-colors"
                      >
                        Help
                      </button>
                    </li>
                  </ul>
                  <div className="py-2">
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden mt-2 space-y-2 px-2 pb-3 bg-white rounded-lg shadow-sm border">
            <button
              onClick={() => handleNavigation("/admindashboard")}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100 font-medium rounded transition-colors"
            >
              Message Users
            </button>
            <button
              onClick={() => handleNavigation("/resync")}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100 font-medium rounded transition-colors"
            >
              Resync Data
            </button>
            <button
              onClick={() => handleNavigation("/help")}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100 font-medium rounded transition-colors"
            >
              Help
            </button>
            <div className="pt-2 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium rounded transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default AdminHeader;