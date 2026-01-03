import { useEffect, useState } from "react";
import { ChatState } from "../../context/ChatProvider";
import { toast } from "react-toastify";
import api from "../../config/api";
import io from "socket.io-client";
import { FaPlus, FaUsers, FaComments, FaLayerGroup } from "react-icons/fa";

// IMPORTS FOR MODALS
import GroupChatModal from "./GroupChatModal";
import UserSearchModal from "./UserSearchModal"; // <--- NEW
import CreateCommunityModal from "../Communities/CreateCommunityModal"; // <--- NEW
import CommunityList from "../Communities/CommunityList";
import StatusView from "../Status/StatusView";

const ENDPOINT = "http://localhost:5000";
let socket;

const MyChats = () => {
  const [loggedUser, setLoggedUser] = useState();
  const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();
  const [activeTab, setActiveTab] = useState("chats"); 

  const fetchChats = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await api.get("/chat", config);
      setChats(data);
    } catch (error) {
      toast.error("Failed to load chats");
    }
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("refetch chats", () => fetchChats());
  }, [user]);

  const getSender = (loggedUser, users) => {
    if(!users || !loggedUser) return "User";
    return users[0]._id === loggedUser?._id ? users[1].name : users[0].name;
  };
  
  const getSenderPic = (loggedUser, users) => {
    if(!users || !loggedUser) return "";
    return users[0]._id === loggedUser?._id ? users[1].pic : users[0].pic;
  };

  const allChats = chats; 
  const groupChats = chats.filter((c) => c.isGroupChat);

  return (
    <div className={`flex flex-col bg-white w-full md:w-[31%] h-full rounded-none border-0 md:rounded-lg md:border border-gray-200 overflow-hidden ${selectedChat ? "hidden md:flex" : "flex"}`}>
      
      {/* --- HEADER WITH DYNAMIC BUTTONS --- */}
      <div className="px-3 py-3 flex justify-between items-center bg-gray-50 border-b">
        <h2 className="text-xl font-bold text-gray-800 font-sans capitalize">
            {activeTab}
        </h2>
        
        {/* BUTTON LOGIC */}
        {activeTab === "chats" && (
            <UserSearchModal>
                <button className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-md text-sm transition font-medium shadow-sm">
                    <FaPlus className="text-xs" /> New Chat
                </button>
            </UserSearchModal>
        )}

        {activeTab === "groups" && (
            <GroupChatModal>
                <button className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-md text-sm transition font-medium">
                    <FaPlus className="text-xs" /> New Group
                </button>
            </GroupChatModal>
        )}

        {activeTab === "communities" && (
            <CreateCommunityModal>
                <button className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-md text-sm transition font-medium">
                    <FaPlus className="text-xs" /> New Community
                </button>
            </CreateCommunityModal>
        )}
      </div>

      {/* --- TABS --- */}
      <div className="flex justify-around items-center bg-white border-b border-gray-100 sticky top-0 z-10">
        <button onClick={() => setActiveTab("chats")} className={`flex-1 py-3 text-sm font-medium flex justify-center items-center gap-2 transition relative ${activeTab === "chats" ? "text-teal-600" : "text-gray-500 hover:bg-gray-50"}`}>
            <FaComments /> Chats
            {activeTab === "chats" && <div className="absolute bottom-0 w-full h-[3px] bg-teal-600 rounded-t-full"></div>}
        </button>

        <button onClick={() => setActiveTab("groups")} className={`flex-1 py-3 text-sm font-medium flex justify-center items-center gap-2 transition relative ${activeTab === "groups" ? "text-teal-600" : "text-gray-500 hover:bg-gray-50"}`}>
            <FaLayerGroup /> Groups
            {activeTab === "groups" && <div className="absolute bottom-0 w-full h-[3px] bg-teal-600 rounded-t-full"></div>}
        </button>

        <button onClick={() => setActiveTab("communities")} className={`flex-1 py-3 text-sm font-medium flex justify-center items-center gap-2 transition relative ${activeTab === "communities" ? "text-teal-600" : "text-gray-500 hover:bg-gray-50"}`}>
            <FaUsers /> Community
            {activeTab === "communities" && <div className="absolute bottom-0 w-full h-[3px] bg-teal-600 rounded-t-full"></div>}
        </button>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="flex-1 overflow-y-scroll no-scrollbar bg-white p-0">
        
        {activeTab === "communities" ? (
            <div className="p-2"><CommunityList /></div>
        ) : (
            <div className="flex flex-col">
                {activeTab === "chats" && <div className="mb-2"><StatusView /></div>}

                <div className="px-2 pb-2 flex flex-col gap-1">
                    {(activeTab === "chats" ? allChats : groupChats).map((chat) => (
                        <div key={chat._id} onClick={() => setSelectedChat(chat)} className={`cursor-pointer px-3 py-3 rounded-lg flex items-center gap-3 transition-colors ${selectedChat === chat ? "bg-teal-50" : "hover:bg-gray-50"}`}>
                            <div className="relative w-12 h-12 flex-shrink-0">
                                <img src={!chat.isGroupChat ? getSenderPic(loggedUser, chat.users) : "https://cdn-icons-png.flaticon.com/512/166/166258.png"} alt="avatar" className="w-full h-full rounded-full object-cover border border-gray-100"/>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h4 className="text-gray-900 font-semibold truncate text-[15px]">
                                        {!chat.isGroupChat ? getSender(loggedUser, chat.users) : chat.chatName}
                                    </h4>
                                    {chat.latestMessage && (
                                        <span className="text-[10px] text-gray-400">
                                            {new Date(chat.latestMessage.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 truncate">
                                    {chat.latestMessage ? (
                                        <span>{chat.isGroupChat && <span className="font-bold text-gray-700">{chat.latestMessage.sender.name}: </span>}{chat.latestMessage.content.substring(0, 36)}</span>
                                    ) : <span className="italic text-gray-400">No messages yet</span>}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default MyChats;