// import { useEffect, useState, useContext } from "react";
// import { useChat } from "../Context/ChatContext";
// import { UserDataContext } from "../Context/UserContext";
// import { io } from "socket.io-client";

// export default function UserChatPage() {
//   const { user } = useContext(UserDataContext);
//   const { chatData } = useChat();
//   const [messages, setMessages] = useState([]);
//   const [newMsg, setNewMsg] = useState("");
//    const newSocket = io(`${import.meta.env.VITE_BASE_URL}`, {
//       path: "/api/socket.io",
//       transports: ["websocket"],
//       auth: { token: localStorage.getItem("token") },
//       withCredentials: true,
//     });

//   useEffect(() => {
//     if (!chatData.open || !chatData.adminId) return;
     
  

//     // Join room with both IDs
//     newSocket.emit("join-chat", { userId: user.id, adminId: chatData.adminId });

//     newSocket.on("chat-joined", ({ room, adminId }) => {
//       console.log("Joined room:", room, "with Admin:", adminId);
//     });

//     newSocket.on("receive-message", (msg) => {
//       setMessages((prev) => [...prev, msg]);
//     });

//     return () => {
//       newSocket.off("receive-message");
//     };
//   }, [chatData, user.id]);

//   const sendMessage = () => {
//     if (!newMsg.trim()) return;

//     const msgObj = {
//       senderId: user.id,
//       receiverId: chatData.adminId,
//       senderRole: "USER",
//       content: newMsg,
//     };

//     newSocket.emit("send-message", msgObj);

//     setMessages((prev) => [...prev, msgObj]);
//     setNewMsg("");
//   };



//   return (
//     <div className="flex flex-col h-screen bg-gray-100">
//       <div className="p-4 bg-blue-600 text-white font-semibold shadow">
//         Chat with Admin ({chatData.adminId})
//       </div>

//       <div className="flex-1 overflow-y-auto p-4 space-y-2">
//         {messages.map((m, i) => (
//           <div
//             key={i}
//             className={`flex ${
//               m.senderRole === "USER" ? "justify-end" : "justify-start"
//             }`}
//           >
//             <div
//               className={`px-3 py-2 rounded-2xl max-w-xs ${
//                 m.senderRole === "USER"
//                   ? "bg-blue-500 text-white rounded-br-none"
//                   : "bg-gray-300 text-black rounded-bl-none"
//               }`}
//             >
//               {m.content}
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className="p-3 bg-white shadow flex">
//         <input
//           className="flex-1 border rounded-l px-3 py-2 focus:outline-none"
//           value={newMsg}
//           onChange={(e) => setNewMsg(e.target.value)}
//           placeholder="Type a message..."
//         />
//         <button
//           className="bg-blue-600 text-white px-4 rounded-r"
//           onClick={sendMessage}
//         >
//           Send
//         </button>
//       </div>
//     </div>
//   );
// }
import React from 'react'

function UserChatPage() {
  return (
    <div className='flex justify-center items-center font-extrabold text-9xl'>Chat feture will be available soon</div>
  )
}

export default UserChatPage
