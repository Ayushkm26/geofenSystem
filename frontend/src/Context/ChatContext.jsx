import { createContext, useState, useContext } from "react";

// Create context
const ChatContext = createContext();

export function ChatProvider({ children }) {
  const [chatData, setChatData] = useState({
    open: true,
    adminId: "admin-1", // Replace with real admin ID dynamically
    userId:[],   // Replace with real user ID dynamically
  });

  return (
    <ChatContext.Provider value={{ chatData, setChatData }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used within a ChatProvider");
  return context;
}
