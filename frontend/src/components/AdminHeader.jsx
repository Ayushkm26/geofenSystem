import React, { useState, useRef, useEffect, useContext } from "react";
import { AdminDataContext } from "../Context/AdminContex"; 
import { useNavigate } from "react-router-dom";                                                            

const AdminHeader = () => {
  const { admin } = useContext(AdminDataContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  return (
    <header>
      <nav className="bg-gray-100 px-4 lg:px-6 py-2.5 w-full border-b border-green-400">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <a href="/admindashboard" className="flex items-center space-x-2">
            <img
              src="https://imgs.search.brave.com/YVLjeEqEj-qfq78AiKd_8whXU8n29tC8dR6_cdfqhZ4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wMjcv/MTc5LzQwMC9zbWFs/bC9sb2NhdGlvbi1t/YXAtYWRkcmVzcy1p/Y29uLXN5bWJvbC1m/cmVlLXBuZy5wbmc"
              className="h-10 w-auto"
              alt="Logo"
            />
            <span className="text-xl font-semibold text-gray-800">
              GeoFence System
            </span>
          </a>

          {/* Desktop: Free + Avatar */}
          <div className="hidden sm:flex items-center space-x-4">
            <p>
              <strong className="text-gray-800 font-bold">Free</strong>
            </p>
            <div ref={avatarRef} className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center justify-center h-10 w-10 text-lg bg-white font-bold text-black rounded-full focus:outline-none"
              >
                {admin?.name ? admin.name.charAt(0).toUpperCase() : "A"}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white divide-y divide-gray-100 rounded-lg shadow-sm z-50">
                  <div className="px-4 py-3 text-sm text-gray-900">
                    <div className="font-semibold">{admin?.name}</div>
                    <div className="truncate">{admin?.email}</div>
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
                      href="/adminlogout"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-medium"
                    >
                      Logout
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile: Avatar at right + Hamburger */}
          <div className="sm:hidden flex items-center space-x-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-800 focus:outline-none text-2xl"
            >
              ☰
            </button>
            <div ref={avatarRef} className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center justify-center h-10 w-10 text-lg bg-white font-bold text-black rounded-full focus:outline-none"
              >
                {admin?.name ? admin.name.charAt(0).toUpperCase() : "A"}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white divide-y divide-gray-100 rounded-lg shadow-sm z-50">
                  <div className="px-4 py-3 text-sm text-gray-900">
                    <div className="font-semibold">{admin?.name}</div>
                    <div className="truncate">{admin?.email}</div>
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
         <button
         onClick={() => {
         navigate("/adminlogout");
         setDropdownOpen(false);
         }}
       className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-medium"
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
          <div className="sm:hidden mt-2 space-y-2 px-2 pb-3">
            <a
              href="/admindashboard"
              className="block px-4 py-2 hover:bg-gray-100 font-medium rounded"
            >
              Message Users
            </a>
            <a
              href="#"
              className="block px-4 py-2 hover:bg-gray-100 font-medium rounded"
            >
              Resync Data
            </a>
            <a
              href="#"
              className="block px-4 py-2 hover:bg-gray-100 font-medium rounded"
            >
              Help
            </a>
          <div className="py-2">
         <button
         onClick={() => {
         navigate("/adminlogout");
         setDropdownOpen(false);
         }}
       className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-medium"
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
