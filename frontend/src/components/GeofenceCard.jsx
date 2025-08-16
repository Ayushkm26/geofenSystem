import React from "react";

function GeofenceCard() {
  return (
    <div className="w-full sm:w-[500px] h-[220px] p-6 bg-white border border-gray-200 rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-700 flex flex-col justify-between">
      {/* Header with status dot */}
      <div className="flex flex-row items-center mb-3">
        <div className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
          Active GeoFence Detection
        </div>
        <span
          className="inline-block w-3 h-3 rounded-full bg-green-500 ml-3"
          title="Active"
        ></span>
      </div>

      {/* Geofence details */}
      <div>
        <p className="mb-2 text-sm font-normal text-gray-700 dark:text-gray-400">
          Geofence Name:
        </p>
        <p className="mb-2 text-sm font-normal text-gray-700 dark:text-gray-400">
          Geofence Description:
        </p>
        <p className="text-sm font-normal text-gray-700 dark:text-gray-400">
          Geofence ID:
        </p>
      </div>

      {/* Bottom row */}
      <div className="flex flex-row justify-between items-center mt-4">
        <p className="text-sm font-normal text-gray-700 dark:text-gray-400">
          Radius:
        </p>
        <p className="text-sm font-normal text-gray-700 dark:text-gray-400">
          Latitude:
        </p>
        <p className="text-sm font-normal text-gray-700 dark:text-gray-400">
          Longitude:
        </p>
      </div>
    </div>
  );
}

export default GeofenceCard;
