import { createContext, useState, useEffect } from 'react';
export const AdminDataContext = createContext();
export default function AdminContext({ children }) {
  const [admin, setAdmin] = useState({
    name: "",
    email: "",
    id: "",
  });

  return (
    <AdminDataContext.Provider value={{ admin, setAdmin }}>
      {children}
    </AdminDataContext.Provider>
  );
}
