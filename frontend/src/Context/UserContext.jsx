import { createContext } from 'react';
import { useState } from 'react';

export const UserDataContext = createContext();

export default function Usercontext({children}) {
    const [user, setUser] = useState({
        name: "",
        email: "",
        id:"",
       
    });
    return (
        <div>
        <UserDataContext.Provider value={{ user, setUser }}>
        {children}
        </UserDataContext.Provider>
        </div>
    );
}

export const LocationContext = createContext();

export function LocationProvider({ children }) {
    const [geofenceLocation, setGeofenceLocation] = useState({
        name:"",
        latitude: "",
        longitude: "",
        radius: "",
        description: "",

    });

    return (
        <LocationContext.Provider value={{ geofenceLocation, setGeofenceLocation }}>
            {children}
        </LocationContext.Provider>
    );
}