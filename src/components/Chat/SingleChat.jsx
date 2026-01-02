import { useEffect, useState } from "react";
import { ChatState } from "../../context/ChatProvider";
import { IoArrowBack, IoTrash } from "react-icons/io5"; // Combined imports
import ScrollableChat from "./ScrollableChat";
import io from "socket.io-client";
import api from "../../config/api";
import { toast } from "react-toastify";
import { FaEye } from "react-icons/fa"; 
import GroupInfoModal from "./GroupInfoModal"; 

// Ensure this matches your backend port
const ENDPOINT = "http://localhost:5000"; 
let socket, selectedChatCompare;

const SingleChat = () => {
  // Added chats and setChats to Context destructuring for delete logic
  const { user, selectedChat, setSelectedChat, notification, setNotification, chats, setChats } = ChatState();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  
  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
  }, []);

  useEffect(() => {
    fetchMessages();
    markMessagesAsRead(); // <--- CALL THIS WHEN OPENING CHAT
    
    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    socket.on("message received", (newMessageRecieved) => {
      if (!selectedChatCompare || selectedChatCompare._id !== newMessageRecieved.chat._id) {
        // Notification logic...
      } else {
        setMessages([...messages, newMessageRecieved]);
        markMessagesAsRead(); // <--- CALL THIS IF I AM WATCHING THE CHAT
      }
    });
    
    // NEW: Listen for when OTHER person reads MY message
    socket.on("message read", () => {
        // Just re-fetch messages to update the ticks
        fetchMessages(); 
    });
  });

  const fetchMessages = async () => {
    if (!selectedChat) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      setLoading(true);
      const { data } = await api.get(`/message/${selectedChat._id}`, config);
      setMessages(data);
      setLoading(false);
      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast.error("Failed to load messages");
      setLoading(false);
    }
  };

  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage) {
      // Safety Check: Stop if ID is missing
      if (!selectedChat || !selectedChat._id) {
        console.error("ERROR: Chat ID is missing! Cannot send.");
        return;
      }

      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        
        const messagePayload = {
            content: newMessage,
            chatId: selectedChat._id
        };

        setNewMessage(""); // Clear input UI
        
        const { data } = await api.post("/message", messagePayload, config);

        socket.emit("new message", data);
        setMessages([...messages, data]);
      } catch (error) {
        console.error("Send Error:", error.response?.data); 
        toast.error("Failed to send message");
      }
    }
  };

  // --- HELPER FUNCTION: Get the name of the other person in 1-on-1 chat ---
  const getSender = (loggedUser, users) => {
    if (!users || !loggedUser) return "User";
    return users[0]._id === loggedUser._id ? users[1].name : users[0].name;
  };

  // Function to mark messages as read
  const markMessagesAsRead = async () => {
    if (!selectedChat) return;
    
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await api.put("/message/read", { chatId: selectedChat._id }, config);
      
      // Tell Socket to notify the sender
      socket.emit("mark messages read", selectedChat._id);
    } catch (error) {
      console.error("Failed to mark read");
    }
  };

  // Function to delete the current 1-on-1 chat
  const deleteCurrentChat = async () => {
    if (!window.confirm("Permanently delete this chat?")) return;

    try {
      const config = { 
        headers: { Authorization: `Bearer ${user.token}` },
        data: { chatId: selectedChat._id }
      };

      await api.delete("/chat/delete", config);

      // Remove from sidebar list
      setChats(chats.filter((c) => c._id !== selectedChat._id));
      setSelectedChat(""); // Close chat
      toast.error("Chat deleted");
    } catch (error) {
      toast.error("Failed to delete chat");
    }
  };

  return (
    <div 
      className={`
        flex flex-col 
        bg-white 
        w-full 
        h-full 
        rounded-lg 
        border 
        border-gray-200 
        overflow-hidden
        ${selectedChat ? "flex" : "hidden md:flex"} 
      `}
    >
      {selectedChat ? (
        <>
          {/* --- CHAT HEADER --- */}
          <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shadow-sm min-h-[60px]">
            <div className="flex items-center gap-3">
                {/* Back Button (Visible ONLY on Mobile) */}
                <button 
                    className="md:hidden p-1 hover:bg-gray-100 rounded-full transition" 
                    onClick={() => setSelectedChat("")} // <-- This logic takes us back to list
                >
                    <IoArrowBack size={24} />
                </button>
                
                {/* Chat Name */}
                <h2 className="text-xl font-sans font-medium text-gray-800 truncate max-w-[200px] md:max-w-md">
                    {!selectedChat.isGroupChat ? getSender(user, selectedChat.users) : selectedChat.chatName}
                </h2>
            </div>

            <div className="flex items-center gap-2">
                {selectedChat.isGroupChat && (
                    <button 
                        onClick={() => setShowGroupInfo(true)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded-md flex items-center gap-2 text-sm transition"
                    >
                        <FaEye /> <span className="hidden sm:inline">Info</span>
                    </button>
                )}

                {!selectedChat.isGroupChat && (
                     <button 
                        onClick={deleteCurrentChat}
                        className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition"
                     >
                        <IoTrash size={20} />
                     </button>
                )}
            </div>
          </div>

          {/* --- CHAT BODY --- */}
          <div className="flex flex-col justify-end p-3 bg-[#efeae2] w-full h-full overflow-hidden relative">
            {loading ? (
              <div className="self-center m-auto text-xl text-gray-500 animate-pulse">
                  Loading messages...
              </div>
            ) : (
              <div className="flex flex-col overflow-y-scroll no-scrollbar h-full mb-2">
                <ScrollableChat messages={messages} />
              </div>
            )}

            {/* --- INPUT AREA --- */}
            <div className="mt-auto w-full">
              <input 
                className="w-full bg-white p-3 rounded-lg outline-none border border-gray-300 focus:border-teal-500 transition shadow-sm text-sm md:text-base"
                placeholder="Enter a message.." 
                onKeyDown={sendMessage}
                onChange={(e) => setNewMessage(e.target.value)} 
                value={newMessage} 
              />
            </div>
          </div>
        </>
      ) : (
        // --- NO CHAT SELECTED (Desktop View) ---
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/1200px-WhatsApp.svg.png" 
            alt="Welcome" 
            className="w-20 h-20 opacity-30 mb-4 grayscale"
          />
          <h2 className="text-2xl font-light text-gray-600 font-sans">
            WhatsApp Clone for Web
          </h2>
          <p className="text-sm text-gray-400 mt-2">
            Send and receive messages without keeping your phone online.
          </p>
        </div>
      )}
      
      {showGroupInfo && <GroupInfoModal onClose={() => setShowGroupInfo(false)} />}
    </div>
  );
};

export default SingleChat;