import React, { useState, useRef, useEffect, useContext } from "react";
import { AdminDataContext } from "../Context/AdminContex";                                                             
const AdminHeader = () => {
  const { admin } = useContext(AdminDataContext);
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
        <div className="flex justify-between px-10">
          {/* Left Side: Logo */}
          <a href={"/admindashboard"} className="flex justify-center">
            <img
              src="https://imgs.search.brave.com/YVLjeEqEj-qfq78AiKd_8whXU8n29tC8dR6_cdfqhZ4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wMjcv/MTc5LzQwMC9zbWFs/bC9sb2NhdGlvbi1t/YXAtYWRkcmVzcy1p/Y29uLXN5bWJvbC1m/cmVlLXBuZy5wbmc"
              className="h-10 sm:h-10"
              alt="Logo"
            />
            <span className="self-center text-xl font-semibold whitespace-nowrap text-gray-800 ml-2">
              GeoFence System
            </span>
          </a>

          
                <div className="flex items-center space-x-4 relative">
                <p>
                    <strong className="text-gray-800 font-bold mr-2">Free</strong> 
                </p>

                {/* Avatar */}
            <div ref={avatarRef} className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center justify-center h-10 w-10 text-2xl bg-white font-bold text-black rounded-full cursor-pointer focus:outline-none"
              >
                {admin?.name ? admin.name.charAt(0).toUpperCase() : "A"}
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
                  <div>{admin?.name}</div>
                  <div className="font-medium truncate">{admin?.email}</div>
                </div>

                <ul className="py-2 text-sm text-gray-700">
                  <li>
                    <a href="/admindashboard" className="block px-4 py-2 font-medium hover:bg-gray-100">
                      Message Users
                    </a>
                  </li>
                  <li>
                    <a href="#" className="block px-4 py-2 font-medium hover:bg-gray-100">
                      Resync Data
                    </a>
                  </li>
                  <li>
                    <a href="#" className="block px-4 py-2 font-medium hover:bg-gray-100">
                      Help
                    </a>
                  </li>
                </ul>

                <div className="py-2">
                  <a
                    href={"/adminlogout"}
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

export default AdminHeader;
