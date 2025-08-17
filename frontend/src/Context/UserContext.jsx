import { createContext, useState, useEffect } from 'react';

export const UserDataContext = createContext();

export default function Usercontext({ children }) {
  const [user, setUser] = useState({
    name: "",
    email: "",
    id: "",
  });

  return (
    <UserDataContext.Provider value={{ user, setUser }}>
      {children}
    </UserDataContext.Provider>
  );
}

export const LocationContext = createContext();

export function LocationProvider({ children }) {
  const [geofenceLocation, setGeofenceLocation] = useState({
    name: "",
    latitude: "",
    longitude: "",
    radius: "",
    description: "",
  });

  // ✅ Persist isShared across navigation & refresh
  const [isShared, setIsShared] = useState(() => {
    return localStorage.getItem("isShared") === "true";
  });

  useEffect(() => {
    localStorage.setItem("isShared", isShared);
  }, [isShared]);

  return (
    <LocationContext.Provider value={{ geofenceLocation, setGeofenceLocation, isShared, setIsShared }}>
      {children}
    </LocationContext.Provider>
  );
}
