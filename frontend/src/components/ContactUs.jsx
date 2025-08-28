import React from "react";

function ContactUs() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6">
      <div className="bg-white rounded-2xl p-10 border border-gray-200 shadow-2xl w-full max-w-3xl">
        <div className="text-center">
          {/* Icon */}
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              ></path>
            </svg>
          </div>

          {/* Title */}
          <h3 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-wide">
            Contact Us
          </h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            If you have any questions about this Privacy Policy or our data
            practices, feel free to reach out to our development team.
          </p>

          {/* Contact Info */}
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            {/* Email */}
            <div className="bg-gray-100 hover:bg-gray-200 transition-all rounded-lg px-6 py-4 border border-gray-300 shadow-sm flex items-center space-x-3">
              <svg
                className="w-5 h-5 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                ></path>
              </svg>
              <span className="text-gray-800 font-medium">
                gefence.project@college.edu
              </span>
            </div>

            {/* Team */}
            <div className="bg-gray-100 hover:bg-gray-200 transition-all rounded-lg px-6 py-4 border border-gray-300 shadow-sm flex items-center space-x-3">
              <svg
                className="w-5 h-5 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                ></path>
              </svg>
              <span className="text-gray-800 font-medium">
                College Project Team
              </span>
            </div>

            {/* Project */}
            <div className="bg-gray-100 hover:bg-gray-200 transition-all rounded-lg px-6 py-4 border border-gray-300 shadow-sm flex items-center space-x-3">
              <svg
                className="w-5 h-5 text-purple-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2h3z"
                ></path>
              </svg>
              <span className="text-gray-800 font-medium">Academic Project</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactUs;
