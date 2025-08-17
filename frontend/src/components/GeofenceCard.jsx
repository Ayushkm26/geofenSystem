import React from "react";
import { useContext } from "react";
import { LocationContext } from "../Context/UserContext";
function GeofenceCard() {
  const { geofenceLocation } = useContext(LocationContext);
  if (!geofenceLocation || !geofenceLocation.id) {
    return (
      <div className="w-full sm:w-[500px] h-[220px] p-6 bg-white border border-gray-200 rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-700 flex items-center justify-center">
        <p className="text-gray-500">No active geofence detected</p>
      </div>
    );
  }

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
          Geofence Name:{geofenceLocation ? geofenceLocation.name : "N/A"}
        </p>
        <p className="mb-2 text-sm font-normal text-gray-700 dark:text-gray-400">
          Geofence Description: {geofenceLocation ? geofenceLocation.description : "N/A"}
        </p>
        <p className="text-sm font-normal text-gray-700 dark:text-gray-400">
          Geofence ID:   {geofenceLocation ? geofenceLocation.id : "N/A"}
        </p>
      </div>

      {/* Bottom row */}
      <div className="flex flex-row justify-between items-center mt-4">
        <p className="text-sm font-normal text-gray-700 dark:text-gray-400">
          Radius:  {geofenceLocation ? geofenceLocation.radius : "N/A"}
        </p>
        <p className="text-sm font-normal text-gray-700 dark:text-gray-400">
          Latitude:   {geofenceLocation ? geofenceLocation.latitude : "N/A"}
        </p>
        <p className="text-sm font-normal text-gray-700 dark:text-gray-400">
          Longitude:  {geofenceLocation ? geofenceLocation.longitude : "N/A"}
        </p>
      </div>
    </div>
  );
}

export default GeofenceCard;
