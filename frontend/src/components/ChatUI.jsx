// ChatUI.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Send } from "lucide-react";

export default function ChatUI({ socket, currentUser }) {
  const [availableContacts, setAvailableContacts] = useState([]);
  const [selectedReceiver, setSelectedReceiver] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  // ─── Fetch Contacts ───────────────────────────────
  const fetchContacts = useCallback(async () => {
    try {
      const endpoint =
        currentUser.role === "USER"
          ? `${import.meta.env.VITE_BASE_URL}/api/admins/list`
          : `${import.meta.env.VITE_BASE_URL}/api/users/list`;

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const contacts = await response.json();
        setAvailableContacts(contacts);

        // ✅ Set default contact only once
        if (contacts.length > 0 && !selectedReceiver) {
          setSelectedReceiver(contacts[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch contacts:", err);
    }
  }, [currentUser.role, selectedReceiver]);

  // ─── Load contacts on mount ───────────────────────
  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // ─── Socket listeners (run once per socket change) ─
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (msg) => {
      // Append only if it's for this receiver
      if (
        msg.senderId === selectedReceiver?.id ||
        msg.receiverId === currentUser.id
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [socket, selectedReceiver, currentUser.id]);

  // ─── Auto-scroll to latest ─────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ─── Send Message ─────────────────────────────────
  const sendMessage = () => {
    if (!newMessage.trim() || !selectedReceiver) return;

    const msg = {
      senderId: currentUser.id,
      receiverId: selectedReceiver.id,
      text: newMessage,
      timestamp: new Date(),
    };

    socket.emit("sendMessage", msg);
    setMessages((prev) => [...prev, { ...msg, self: true }]);
    setNewMessage("");
  };

  // ─── UI ──────────────────────────────────────────
  return (
    <div className="flex h-[500px] border rounded shadow-md">
      {/* Sidebar */}
      <div className="w-1/4 border-r overflow-y-auto">
        {availableContacts.map((contact) => (
          <div
            key={contact.id}
            onClick={() => {
              if (selectedReceiver?.id !== contact.id) {
                setSelectedReceiver(contact);
                setMessages([]); // reset chat
              }
            }}
            className={`p-3 cursor-pointer hover:bg-gray-100 ${
              selectedReceiver?.id === contact.id ? "bg-blue-100" : ""
            }`}
          >
            {contact.name} <span className="text-xs">({contact.role})</span>
          </div>
        ))}
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-3">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`my-2 p-2 rounded-lg w-fit max-w-[70%] ${
                msg.self
                  ? "ml-auto bg-blue-500 text-white"
                  : "mr-auto bg-gray-200"
              }`}
            >
              {msg.text}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-2 border-t flex items-center">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border rounded p-2 mr-2"
          />
          <button
            onClick={sendMessage}
            className="bg-blue-500 text-white p-2 rounded flex items-center"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
