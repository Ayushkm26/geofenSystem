import React, { useState, useRef, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserDataContext, LocationContext } from "../Context/UserContext";

const DashboardHeader = ({ type }) => {
  const { user } = useContext(UserDataContext);
  const { isShared } = useContext(LocationContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const avatarRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (avatarRef.current && !avatarRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    // navigate to /userlogout route
    navigate("/userlogout");
    setDropdownOpen(false);
  };

  return (
    <header>
      <nav className="bg-gray-100 px-4 lg:px-6 py-2.5 w-full">
        <div className="flex justify-between items-center px-4 lg:px-10">
          {/* Logo on the left */}
          <a href={"/userdashboard"} className="flex items-center">
            <img
              src="https://imgs.search.brave.com/YVLjeEqEj-qfq78AiKd_8whXU8n29tC8dR6_cdfqhZ4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wMjcv/MTc5LzQwMC9zbWFs/bC9sb2NhdGlvbi1t/YXAtYWRkcmVzcy1p/Y29uLXN5bWJvbC1m/cmVlLXBuZy5wbmc"
              className="h-8 sm:h-10"
              alt="Logo"
            />
            <span className="text-lg sm:text-xl font-semibold text-gray-800 ml-2">
              GeoFence System
            </span>
          </a>

          {/* Right: dot + avatar */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Mobile: dot only */}
            <span
              className={`block sm:hidden h-3 w-3 rounded-full ${
                isShared ? "bg-green-500" : "bg-red-500"
              }`}
            ></span>

            {/* Desktop: status */}
            <p
              className={`hidden sm:flex py-1 px-3 text-gray-800 font-bold rounded items-center
              ${isShared ? "bg-green-500 hover:bg-gray-300" : "bg-red-500 hover:bg-gray-300"}`}
            >
              <img
                className="inline-block h-5 w-5 mr-1"
                src={
                  isShared
                    ? "https://png.pngtree.com/template/20190725/ourmid/pngtree-location-icon-point-green-square-image_282641.jpg"
                    : "https://cdn4.iconfinder.com/data/icons/maps-and-location-vol-2/24/_block-512.png"
                }
                alt="status"
              />
              {isShared ? "Connected" : "Disconnected"}
            </p>

            {/* Avatar */}
            <div ref={avatarRef} className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 text-lg sm:text-2xl bg-white font-bold text-black rounded-full cursor-pointer focus:outline-none"
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
                    <button
                      onClick={() => navigate("/userchat")}
                      className="block w-full text-left px-4 py-2 font-medium hover:bg-gray-100"
                    >
                      Message Admin
                    </button>
                  </li>
                  <li>
                    <button onClick={() => navigate("/userresync")} className="block w-full text-left px-4 py-2 font-medium hover:bg-gray-100">
                      Resync
                    </button>
                  </li>
                  <li>
                    <button onClick={() => navigate("/help")} className="block w-full text-left px-4 py-2 font-medium hover:bg-gray-100">
                      Help
                    </button>
                  </li>
                </ul>

                <div className="py-2">
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 font-medium text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
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
