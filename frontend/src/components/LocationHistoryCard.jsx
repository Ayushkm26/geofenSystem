import React from "react";
import { Link } from "react-router-dom";

function LocationHistoryCard() {
  return (
    <div className="w-full sm:w-[500px] h-[220px] p-6 bg-white border border-gray-200 rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-700 flex flex-col justify-between">
      {/* Title */}
      <div className="text-xl font-bold tracking-tight text-center text-gray-900 dark:text-white">
        Location History
      </div>

      {/* Description */}
      <p className="text-sm text-center text-gray-700 dark:text-gray-400 mt-2">
        View your location history and track your movements over time.
      </p>

      {/* Button */}
      <div className="flex justify-center items-center mt-4">
        <Link to="/locationhistory">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white bg-gray-500 rounded-lg hover:bg-gray-600 focus:ring-4 focus:outline-none"
          >
            View History
          </button>
        </Link>
      </div>
    </div>
  );
}

export default LocationHistoryCard;
