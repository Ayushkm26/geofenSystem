// import { useEffect, useState, useContext } from "react";
// import { io } from "socket.io-client";
// import { useChat } from "../Context/ChatContext";
// import { AdminDataContext } from "../Context/AdminContex";

// export default function AdminChatPage() {
//   const { admin } = useContext(AdminDataContext);
//   const { chatData , setChatData } = useChat();
//   const [messages, setMessages] = useState([]);
//   const [newMsg, setNewMsg] = useState("");
//   const [socket, setSocket] = useState(null);
//   const [selectedUser, setSelectedUser] = useState(null);

  

//   useEffect(() => {
//     if (!chatData?.open || !chatData?.userId) return;

//     const token = localStorage.getItem("token");
//     if (!token) {
//       console.error("No token found!");
//       return;
//     }

//     const adminSocket = io(`${import.meta.env.VITE_BASE_URL}/admin`, {
//       path: "/api/socket.io",
//       transports: ["websocket"],
//       withCredentials: true,
//       auth: { token },
//       timeout: 20000,
//       reconnection: true,
//       reconnectionAttempts: 5,
//       reconnectionDelay: 2000,
//     });

//     setSocket(adminSocket);

//     adminSocket.on("connect", () => {
//       console.log("Admin chat socket connected:", adminSocket.id);

//       // Join chat room
//       adminSocket.emit("join-chat", { userId: chatData.userId });

//       // Fetch chat history
//       adminSocket.emit("fetch-messages", { userId: chatData.userId });
//     });

//     adminSocket.on("receive-message", (msg) => {
//       if (!msg) return;
//       setMessages((prev) => [...prev, msg]);
//     });

//     adminSocket.on("chat-history", (msgs) => {
//       if (!Array.isArray(msgs)) return; // prevent iteration error
//       setMessages(msgs);
//     });

//     adminSocket.on("disconnect", (reason) => {
//       console.log("Admin chat socket disconnected:", reason);
//     });

//     return () => {
//       adminSocket.disconnect();
//     };
//   }, [chatData]);

//   const sendMessage = () => {
//     if (!newMsg.trim() || !socket) return;

//     socket.emit("send-message", {
//       receiverId: chatData.userId,
//       content: newMsg,
//     });

//     setNewMsg("");
//   };

//   if (!chatData?.open) {
//     return (
//       <div className="flex items-center justify-center h-screen text-gray-500">
//         No active chat
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col h-screen bg-gray-100">
//       {/* Header */}
//       <div className="p-4 bg-green-600 text-white font-semibold shadow">
//         Chat with User ({chatData.userId})
//       </div>

//       {/* Messages */}
//       <div className="flex-1 overflow-y-auto p-4 space-y-2">
//         {messages.map((m, i) => (
//           <div
//             key={i}
//             className={`flex ${
//               m.senderRole === "ADMIN" ? "justify-end" : "justify-start"
//             }`}
//           >
//             <div
//               className={`px-3 py-2 rounded-2xl max-w-xs ${
//                 m.senderRole === "ADMIN"
//                   ? "bg-green-500 text-white rounded-br-none"
//                   : "bg-gray-300 text-black rounded-bl-none"
//               }`}
//             >
//               {m.content}
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Input */}
//       <div className="p-3 bg-white shadow flex">
//         <input
//           className="flex-1 border rounded-l px-3 py-2 focus:outline-none"
//           value={newMsg}
//           onChange={(e) => setNewMsg(e.target.value)}
//           placeholder="Type a message..."
//         />
//         <button
//           className="bg-green-600 text-white px-4 rounded-r"
//           onClick={sendMessage}
//         >
//           Send
//         </button>
//       </div>
//     </div>
//   );
// }
import React from 'react'

function AdminChatPage() {
  return (
    <div>AdminChatPage</div>
  )
}

export default AdminChatPage
