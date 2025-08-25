import React, { useState, useRef, useEffect, useContext } from "react";
import { UserDataContext, LocationContext } from "../Context/UserContext";

const DashboardHeader = ({ type }) => {
  const { user } = useContext(UserDataContext);
  const { isShared } = useContext(LocationContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const avatarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (avatarRef.current && !avatarRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header>
      <nav className="bg-gray-100 px-4 lg:px-6 py-2.5 w-full">
        <div className="flex justify-between px-10 items-center">
          {/* Left Side: Logo */}
          <a href="/userdashboard" className="flex items-center">
            <img
              src="https://imgs.search.brave.com/YVLjeEqEj-qfq78AiKd_8whXU8n29tC8dR6_cdfqhZ4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wMjcv/MTc5LzQwMC9zbWFs/bC9sb2NhdGlvbi1t/YXAtYWRkcmVzcy1p/Y29uLXN5bWJvbC1m/cmVlLXBuZy5wbmc"
              className="h-10 sm:h-10"
              alt="Logo"
            />
            <span className="ml-2 text-xl font-semibold text-gray-800">
              GeoFence System
            </span>
          </a>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Desktop: Full Connected/Disconnected Button */}
            <p
              className={`hidden sm:flex py-2 px-4 text-gray-800 font-bold rounded items-center ${
                isShared
                  ? "bg-green-500 hover:bg-gray-300"
                  : "bg-red-500 hover:bg-gray-300"
              }`}
            >
              <img
                className="inline-block h-6 w-6 mr-1"
                src={
                  isShared
                    ? "https://png.pngtree.com/template/20190725/ourmid/pngtree-location-icon-point-green-square-image_282641.jpg"
                    : "https://cdn4.iconfinder.com/data/icons/maps-and-location-vol-2/24/_block-512.png"
                }
                alt="status"
              />
              {isShared ? "Connected" : "Disconnected"}
            </p>

            {/* Mobile: Just a colored dot */}
            <span
              className={`block sm:hidden h-4 w-4 rounded-full ${
                isShared ? "bg-green-500" : "bg-red-500"
              }`}
            ></span>

            {/* Avatar */}
            <div ref={avatarRef} className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center justify-center h-10 w-10 text-2xl bg-white font-bold text-black rounded-full cursor-pointer focus:outline-none"
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </button>

              {/* Dropdown */}
              <div
                className={`absolute right-0 top-full mt-2 w-44 bg-white divide-y divide-gray-100 rounded-lg shadow-sm z-50 transition-all duration-200 transform ${
                  dropdownOpen
                    ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                }`}
              >
                <div className="px-4 py-3 text-sm text-gray-900">
                  <div>{user?.name}</div>
                  <div className="font-medium truncate">{user?.email}</div>
                </div>

                <ul className="py-2 text-sm text-gray-700">
                  <li>
                    <a
                      href="/userdashboard"
                      className="block px-4 py-2 font-medium hover:bg-gray-100"
                    >
                      Message Admin
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="block px-4 py-2 font-medium hover:bg-gray-100"
                    >
                      Resync
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="block px-4 py-2 font-medium hover:bg-gray-100"
                    >
                      Help
                    </a>
                  </li>
                </ul>

                <div className="py-2">
                  <a
                    href={type === "dashboard" ? "/userlogout" : "/userlogin"}
                    className="block px-4 py-2 font-medium text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default DashboardHeader;
