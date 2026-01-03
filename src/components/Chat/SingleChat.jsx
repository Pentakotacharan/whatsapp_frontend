import { useEffect, useState, useRef } from "react";
import { ChatState } from "../../context/ChatProvider";
import { IoArrowBack, IoTrash, IoAttach } from "react-icons/io5"; 
import ScrollableChat from "./ScrollableChat";
import io from "socket.io-client";
import api from "../../config/api";
import { toast } from "react-toastify";
import { FaEye } from "react-icons/fa"; 
import GroupInfoModal from "./GroupInfoModal"; 

const ENDPOINT = "https://whatsapp-backend-rho-sepia.vercel.app/"; 
let socket, selectedChatCompare;

// 1. ADD PROPS HERE
const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const { user, selectedChat, setSelectedChat, notification, setNotification, chats, setChats } = ChatState();
  
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  
  const fileInputRef = useRef(null);
  const [mediaLoading, setMediaLoading] = useState(false);

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
  }, []);

  useEffect(() => {
    fetchMessages();
    markMessagesAsRead(); 
    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  // --- NOTIFICATION & MESSAGE LISTENER ---
  useEffect(() => {
    socket.on("message received", (newMessageRecieved) => {
      if (!selectedChatCompare || selectedChatCompare._id !== newMessageRecieved.chat._id) {
        
        // --- FIX: ADD TO NOTIFICATIONS ---
        // Check if notification already exists to avoid duplicates
        if (!notification.some(n => n._id === newMessageRecieved._id)) {
            setNotification([newMessageRecieved, ...notification]);
            setFetchAgain(!fetchAgain); // Refresh the MyChats list so the new message shows at top
        }

      } else {
        setMessages([...messages, newMessageRecieved]);
        markMessagesAsRead(); 
      }
    });
    
    socket.on("message read", () => {
        fetchMessages(); 
    });
  });

  const handleMediaUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setMediaLoading(true);

    const type = file.type.startsWith("video") ? "video" : "image";
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "sbheume7"); 
    data.append("cloud_name", "dsxn4zfz");       

    try {
      const resourceType = type === "video" ? "video" : "image";
      const res = await fetch(`https://api.cloudinary.com/v1_1/dsxn4zfz/${resourceType}/upload`, {
        method: "post",
        body: data,
      });
      
      const fileData = await res.json();
      const mediaUrl = fileData.url.toString();

      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      const messagePayload = {
          content: type === "image" ? "📷 Image" : "🎥 Video", 
          chatId: selectedChat._id,
          mediaUrl: mediaUrl,
          mediaType: type
      };

      const { data: apiData } = await api.post("/message", messagePayload, config);

      socket.emit("new message", apiData);
      setMessages([...messages, apiData]);
      setMediaLoading(false);
      
    } catch (error) {
      console.error(error);
      setMediaLoading(false);
      toast.error("Media Upload Failed");
    } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

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
      if (!selectedChat || !selectedChat._id) return;

      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const messagePayload = {
            content: newMessage,
            chatId: selectedChat._id
        };

        setNewMessage(""); 
        const { data } = await api.post("/message", messagePayload, config);

        socket.emit("new message", data);
        setMessages([...messages, data]);
      } catch (error) {
        toast.error("Failed to send message");
      }
    }
  };

  const getSender = (loggedUser, users) => {
    if (!users || !loggedUser) return "User";
    return users[0]._id === loggedUser._id ? users[1].name : users[0].name;
  };

  const markMessagesAsRead = async () => {
    if (!selectedChat) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await api.put("/message/read", { chatId: selectedChat._id }, config);
      socket.emit("mark messages read", selectedChat._id);
    } catch (error) {
      console.error("Failed to mark read");
    }
  };

  const deleteCurrentChat = async () => {
    if (!window.confirm("Permanently delete this chat?")) return;
    try {
      const config = { 
        headers: { Authorization: `Bearer ${user.token}` },
        data: { chatId: selectedChat._id }
      };
      await api.delete("/chat/delete", config);
      setChats(chats.filter((c) => c._id !== selectedChat._id));
      setSelectedChat(""); 
      toast.error("Chat deleted");
    } catch (error) {
      toast.error("Failed to delete chat");
    }
  };

  return (
    <div 
      className={`
        flex flex-col bg-white w-full h-full rounded-lg border border-gray-200 overflow-hidden
        ${selectedChat ? "flex" : "hidden md:flex"} 
      `}
    >
      {selectedChat ? (
        <>
          {/* HEADER */}
          <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shadow-sm min-h-[60px]">
            <div className="flex items-center gap-3">
                <button className="md:hidden p-1 hover:bg-gray-100 rounded-full transition" onClick={() => setSelectedChat("")}>
                    <IoArrowBack size={24} />
                </button>
                <h2 className="text-xl font-sans font-medium text-gray-800 truncate max-w-[200px] md:max-w-md">
                    {!selectedChat.isGroupChat ? getSender(user, selectedChat.users) : selectedChat.chatName}
                </h2>
            </div>
            <div className="flex items-center gap-2">
                {selectedChat.isGroupChat && (
                    <button onClick={() => setShowGroupInfo(true)} className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded-md flex items-center gap-2 text-sm transition">
                        <FaEye /> <span className="hidden sm:inline">Info</span>
                    </button>
                )}
                {!selectedChat.isGroupChat && (
                     <button onClick={deleteCurrentChat} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition">
                        <IoTrash size={20} />
                     </button>
                )}
            </div>
          </div>

          {/* CHAT BODY */}
          <div className="flex flex-col justify-end p-3 bg-[#efeae2] w-full h-full overflow-hidden relative">
            {loading ? (
              <div className="self-center m-auto text-xl text-gray-500 animate-pulse">Loading messages...</div>
            ) : (
              <div className="flex flex-col overflow-y-scroll no-scrollbar h-full mb-2">
                <ScrollableChat messages={messages} />
              </div>
            )}

            {/* INPUT AREA */}
            <div className="mt-auto w-full flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
               <button 
                  onClick={() => fileInputRef.current.click()} 
                  disabled={mediaLoading}
                  className="text-gray-500 hover:text-teal-600 transition p-2 hover:bg-gray-100 rounded-full"
               >
                  {mediaLoading ? <span className="text-xs font-bold animate-pulse text-teal-600">...</span> : <IoAttach size={26} />}
               </button>
               <input type="file" accept="image/*, video/*" className="hidden" ref={fileInputRef} onChange={handleMediaUpload} />
               <input 
                  className="w-full bg-transparent outline-none text-gray-700 text-sm md:text-base"
                  placeholder="Enter a message.." 
                  onKeyDown={sendMessage}
                  onChange={(e) => setNewMessage(e.target.value)} 
                  value={newMessage} 
               />
            </div>
          </div>
        </>
      ) : (
        // NO CHAT SELECTED
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/1200px-WhatsApp.svg.png" alt="Welcome" className="w-20 h-20 opacity-30 mb-4 grayscale" />
          <h2 className="text-2xl font-light text-gray-600 font-sans">WhatsApp Clone for Web</h2>
          <p className="text-sm text-gray-400 mt-2">Send and receive messages without keeping your phone online.</p>
        </div>
      )}
      {showGroupInfo && <GroupInfoModal onClose={() => setShowGroupInfo(false)} />}
    </div>
  );
};

export default SingleChat;