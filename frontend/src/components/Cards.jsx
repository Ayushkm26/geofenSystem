import React, { useState, useEffect, useContext, useRef } from "react";
import { io } from "socket.io-client";
import { LocationContext } from "../Context/UserContext"; // adjust path
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { useChat } from "../Context/ChatContext";


function Cards({ isShared, setIsShared }) {
  const { setChatData } = useChat();

  const [isSharing, setIsSharing] = useState(false);
  const [socket, setSocket] = useState(null);
  const intervalRef = useRef(null); // ✅ Ref for intervals
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
      // store adminId to send messages to
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
      // Stop sharing
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
    <div className="custom-rectangle-card w-full sm:w-[500px] h-[220px] p-6 bg-white border border-gray-200 rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-700 flex flex-col justify-between">
      <h5 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
        Start sharing your live location
      </h5>
      <p className="mb-3 text-sm text-gray-700 dark:text-gray-400">
        Share your live location with your friends and family. They can track you in real-time on the map.
      </p>

      <div className="flex justify-center items-center mt-3">
        <button
          type="button"
          className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 mr-3 disabled:opacity-50"
          onClick={() => {
            setIsSharing(true);
            setIsShared(true);
          }}
          disabled={isSharing}
        >
          Start sharing
        </button>

        <button
          type="button"
          className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 ml-3 disabled:opacity-50"
          onClick={() => {
            setIsSharing(false);
            setIsShared(false);
          }}
          disabled={!isSharing}
        >
          Stop sharing
        </button>
      </div>
    </div>
  );
}

export default Cards;
