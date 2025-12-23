import React from "react";
import { useContext } from "react";
import { LocationContext } from "../Context/UserContext";

function GeofenceCard() {
  const { geofenceLocation } = useContext(LocationContext);
  
  if (!geofenceLocation || !geofenceLocation.id) {
    return (
      <div className="w-full sm:w-[500px] h-[220px] bg-gradient-to-br from-gray-50 to-slate-50 border-2 border-gray-200 rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-gray-400 to-slate-500 px-6 py-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h5 className="text-lg font-bold text-white">
              Geofence Status
            </h5>
          </div>
        </div>
        
        <div className="p-6 flex items-center justify-center h-[160px]">
          <div className="text-center">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            <p className="text-sm text-gray-500 font-medium">No active geofence detected</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full sm:w-[500px] h-[220px] bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-100 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Header with gradient accent */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h5 className="text-lg font-bold text-white">
              Active Geofence
            </h5>
          </div>
          <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
            <div className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse"></div>
            <span className="text-xs font-semibold text-white">ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Main Info */}
        <div className="mb-3">
          <p className="text-xs text-gray-600 mb-0.5">Name</p>
          <p className="text-sm text-gray-900 font-semibold mb-2">{geofenceLocation.name || "N/A"}</p>
          
          {geofenceLocation.description && (
            <>
              <p className="text-xs text-gray-600 mb-0.5">Description</p>
              <p className="text-xs text-gray-700 mb-2">{geofenceLocation.description}</p>
            </>
          )}
        </div>

        {/* Details Grid */}
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between bg-white rounded-lg px-2 py-1.5 border border-emerald-100">
            <span className="text-emerald-700 font-medium">ID:</span>
            <span className="text-gray-900 font-mono text-xs">{geofenceLocation.id || "N/A"}</span>
          </div>
          
          <div className="flex items-center justify-between bg-white rounded-lg px-2 py-1.5 border border-emerald-100">
            <span className="text-emerald-700 font-medium">Radius:</span>
            <span className="text-gray-900 font-semibold">{geofenceLocation.radius ? `${geofenceLocation.radius}m` : "N/A"}</span>
          </div>
          
          <div className="flex items-center justify-between bg-white rounded-lg px-2 py-1.5 border border-emerald-100">
            <span className="text-emerald-700 font-medium">Latitude:</span>
            <span className="text-gray-900 font-mono text-xs">{geofenceLocation.latitude || "N/A"}</span>
          </div>
          
          <div className="flex items-center justify-between bg-white rounded-lg px-2 py-1.5 border border-emerald-100">
            <span className="text-emerald-700 font-medium">Longitude:</span>
            <span className="text-gray-900 font-mono text-xs">{geofenceLocation.longitude || "N/A"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GeofenceCard;