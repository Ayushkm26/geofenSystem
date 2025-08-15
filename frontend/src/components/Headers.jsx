import React, { useState, useRef, useEffect } from "react";

const Header = ({ type }) => {
  const [showFeatures, setShowFeatures] = useState(false);
  const [showContact, setShowContact] = useState(false);

  const featuresRef = useRef(null);
  const contactRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (featuresRef.current && !featuresRef.current.contains(event.target)) {
        setShowFeatures(false);
      }
      if (contactRef.current && !contactRef.current.contains(event.target)) {
        setShowContact(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header>
      <nav className="bg-black border-gray-200 px-4 lg:px-6 py-2.5">
        <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
          {/* Logo */}
          <a href="/" className="flex items-center">
            <img
              src="https://imgs.search.brave.com/xjCGFjYv__vy39UxRYkmILiqGXjTqXMDNLA4lxd9XWk/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzLzNmLzZk/LzY0LzNmNmQ2NGU3/MmViZmQwNWNlOGY0/ZjZiN2M2OTEzOTZk/LmpwZw"
              className="mr-3 h-10 sm:h-10"
              alt="Logo"
            />
            <span className="self-center text-xl font-semibold whitespace-nowrap text-white">
              GeoFence System
            </span>
          </a>

          {/* Right Side Buttons */}
          <div className="flex items-center lg:order-2">
            <a
              href={type === "signUp" ? "/userlogin" : "/usersignup"}
              className="block py-2 px-4 font-medium text-white bg-primary-700 rounded hover:bg-primary-800"
            >
              {type === "signUp" ? "SignIn" : "Signup"}
            </a>
          </div>

          {/* Menu */}
          <div
            className="hidden lg:flex lg:space-x-8 lg:order-1"
            id="mobile-menu-2"
          >
            <a
              href="/"
              className="py-2 px-4 text-white hover:text-gray-300"
            >
              Home
            </a>

            {/* Features with Dropdown */}
            <div className="relative" ref={featuresRef}>
              <button
                onClick={() => setShowFeatures(!showFeatures)}
                className="py-2 px-4 text-white hover:text-gray-300"
              >
                Features ▼
              </button>
              {showFeatures && (
                <div className="absolute mt-2 bg-white rounded shadow-lg w-40 z-50">
                  <h1 className="block px-4 py-2 text-black font-semibold text-sm hover:bg-gray-100">
                    Create & Manage Geo-Fences
                  </h1>
                  <h1 className="block px-4 py-2 text-black font-semibold text-sm hover:bg-gray-100">
                    Real-Time Location Tracking
                  </h1>
                  <h1 className="block px-4 py-2 text-black font-semibold text-sm hover:bg-gray-100">
                    Entry/Exit Detection
                  </h1>
                  <h1 className="block px-4 py-2 text-black font-semibold text-sm hover:bg-gray-100">
                    Time-Based Geo-Fences
                  </h1>
                </div>
              )}
            </div>

            {/* Contact with Email */}
            <div className="relative" ref={contactRef}>
              <button
                onClick={() => setShowContact(!showContact)}
                className="py-2 px-4 text-white hover:text-gray-300"
              >
                Contact ▼
              </button>
              {showContact && (
                <div className="absolute mt-2 bg-white rounded shadow-lg w-56 z-50 p-4 text-black">
                  📧 Email:{" "}
                  <a
                    href="mailto:support@example.com"
                    className="text-blue-600 underline"
                  >
                    support@example.com
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
