import React from "react";
import { Link } from "react-router-dom";

function LocationHistoryCard() {
  return (
    <div className="w-full sm:w-[500px] h-[220px] bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-100 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Header with gradient accent */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h5 className="text-lg font-bold text-white">
            Location History
          </h5>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-gray-700 text-sm leading-relaxed mb-3">
          Access your complete location timeline and analyze your movement patterns over time. Review past routes and destinations.
        </p>

        {/* Features List */}
        <div className="mb-3 space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <svg className="w-3.5 h-3.5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Track past movements</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <svg className="w-3.5 h-3.5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>View timeline data</span>
          </div>
        </div>

        {/* Action Button */}
        <Link to="/locationhistory" className="block">
          <button
            type="button"
            className="w-full px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl hover:from-purple-600 hover:to-pink-700 hover:shadow-lg hover:scale-105 transition-all duration-200 shadow-md"
          >
            <span className="flex items-center justify-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              View History
            </span>
          </button>
        </Link>
      </div>
    </div>
  );
}

export default LocationHistoryCard;