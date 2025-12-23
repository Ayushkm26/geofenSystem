import React, { useState, useEffect, useContext, useRef } from "react";
import { io } from "socket.io-client";
import { LocationContext } from "../Context/UserContext";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { useChat } from "../Context/ChatContext";

function Cards({ isShared, setIsShared }) {
  const { setChatData } = useChat();

  const [isSharing, setIsSharing] = useState(false);
  const [socket, setSocket] = useState(null);
  const intervalRef = useRef(null);
  const [visitorId, setVisitorId] = useState(null);

  const [outside, setOutside] = useState(false);
  const { geofenceLocation, setGeofenceLocation } = useContext(LocationContext);

  // Generate unique visitor ID
  useEffect(() => {
    const generateVisitorId = async () => {
      if (!localStorage.getItem("visitorId")) {
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        localStorage.setItem("visitorId", result.visitorId);
        setVisitorId(result.visitorId);
      } else {
        setVisitorId(localStorage.getItem("visitorId"));
      }
    };
    generateVisitorId();
  }, []);

  // Setup socket
  useEffect(() => {
    const newSocket = io(`${import.meta.env.VITE_BASE_URL}`, {
      path: "/api/socket.io",
      transports: ["websocket"],
      auth: { token: localStorage.getItem("token") },
      withCredentials: true,
    });

    setSocket(newSocket);

    // Handle geofence events
    newSocket.on("geofence-details", (data) => {
      console.log("Inside geofence:", data);
      setGeofenceLocation({
        id: data?.id,
        name: data?.name,
        latitude: data?.latitude,
        longitude: data?.longitude,
      });
      setOutside(false);
    });

    newSocket.on("outside-geofence", (data) => {
      console.log("Outside geofence:", data);
      setGeofenceLocation(
        data?.latitude != null && data?.longitude != null
          ? { latitude: data.latitude, longitude: data.longitude }
          : null
      );
      setOutside(true);
    });
    
    newSocket.on("open-chat", ({ adminId }) => {
      console.log("User entered admin geofence, opening chat with:", adminId);
      setChatData({ open: true, adminId });
    });

    newSocket.on("location-error", (err) => {
      console.error("Location error:", err);
      setGeofenceLocation(null);
      setOutside(false);
    });

    newSocket.on("connect", () => {
      console.log("Socket connected, requesting current geofence...");
      newSocket.emit("get-current-geofence");
    });

    return () => {
      console.log("Cleaning up socket...");
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      newSocket.disconnect();
    };
  }, [setGeofenceLocation]);

  // Handle live location sharing
  useEffect(() => {
    if (!socket) return;

    if (isSharing) {
      if (!navigator.geolocation) {
        console.error("Geolocation not supported.");
        return;
      }

      intervalRef.current = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            console.log("Sending location:", { latitude, longitude });

            socket.emit("location-update", {
              latitude,
              longitude,
              timestamp: new Date(),
              visitorId,
            });
          },
          (error) => console.error("Error fetching location:", error.message),
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }, 5000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        if (socket) {
          socket.emit("stop-sharing", { timestamp: new Date(), visitorId });
          console.log("Sent stop-sharing event");
        }
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isSharing, socket, visitorId]);

  return (
    <div className="w-full sm:w-[500px] h-[220px] bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-100 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Header with gradient accent */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h5 className="text-lg font-bold text-white">
            Live Location Sharing
          </h5>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-gray-700 text-sm leading-relaxed mb-3">
          Share your live location with your friends and family. They can track you in real-time on the map.
        </p>

        {/* Status Indicator */}
        {isSharing && (
          <div className="mb-3 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-700 font-medium">Location sharing active</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            type="button"
            className={`flex-1 px-4 py-2 text-sm font-semibold text-white rounded-xl transition-all duration-200 shadow-md
              ${isSharing 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:shadow-lg hover:scale-105'
              }`}
            onClick={() => {
              setIsSharing(true);
              setIsShared(true);
            }}
            disabled={isSharing}
          >
            <span className="flex items-center justify-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Start sharing
            </span>
          </button>

          <button
            type="button"
            className={`flex-1 px-4 py-2 text-sm font-semibold text-white rounded-xl transition-all duration-200 shadow-md
              ${!isSharing 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 hover:shadow-lg hover:scale-105'
              }`}
            onClick={() => {
              setIsSharing(false);
              setIsShared(false);
            }}
            disabled={!isSharing}
          >
            <span className="flex items-center justify-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
              Stop sharing
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Cards;