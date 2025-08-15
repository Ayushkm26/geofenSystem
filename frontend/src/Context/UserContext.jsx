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
