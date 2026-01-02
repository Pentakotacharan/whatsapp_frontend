import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChatState } from "../../context/ChatProvider";
import ProfileModal from "./ProfileModal";
import { toast } from "react-toastify";
import api from "../../config/api";
import { FaSearch, FaBell, FaChevronDown } from "react-icons/fa";

const SideDrawer = () => {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  
  // Toggle States
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false); 
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  // NEW: State for Notification Dropdown
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const { 
    user, 
    setSelectedChat, 
    chats, 
    setChats, 
    notification, 
    setNotification 
  } = ChatState();
  
  const navigate = useNavigate();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  const handleSearch = async () => {
    if (!search) {
      toast.warning("Please enter something in search");
      return;
    }

    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await api.get(`/user?search=${search}`, config);
      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      setLoading(false);
      toast.error("Failed to Load the Search Results");
    }
  };

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const config = { headers: { "Content-type": "application/json", Authorization: `Bearer ${user.token}` } };
      const { data } = await api.post(`/chat`, { userId }, config);

      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      
      setSelectedChat(data);
      setLoadingChat(false);
      setIsSearchOpen(false);
    } catch (error) {
      setLoadingChat(false);
      toast.error("Error fetching the chat");
    }
  };

  // --- LOGIC: Helper to get sender name ---
  const getSender = (loggedUser, users) => {
    return users[0]._id === loggedUser._id ? users[1].name : users[0].name;
  };

  return (
    <>
      <div className="flex justify-between items-center bg-white w-full px-5 py-3 border-b-4 border-gray-100 relative">
        
        {/* Search Button */}
        <button 
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-2 text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-lg transition"
        >
          <FaSearch />
          <span className="hidden md:inline font-medium">Search User</span>
        </button>

        {/* Logo */}
        <h1 className="text-2xl font-sans font-light text-gray-800">
          WhatsApp Clone
        </h1>

        {/* Right Menu */}
        <div className="flex items-center gap-4">
          
          {/* --- NOTIFICATION BELL --- */}
          <div className="relative">
            <button 
                onClick={() => setIsNotificationOpen(!isNotificationOpen)} // Toggle Dropdown
                className="relative text-gray-600 text-xl hover:text-teal-600 transition p-1"
            >
                <FaBell />
                {notification.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full animate-bounce">
                    {notification.length}
                </span>
                )}
            </button>

            {/* Notification Dropdown Menu */}
            {isNotificationOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1">
                    {!notification.length && (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                            No New Messages
                        </div>
                    )}

                    {notification.map((notif) => (
                        <div 
                            key={notif._id}
                            onClick={() => {
                                setSelectedChat(notif.chat); // Open the chat
                                setNotification(notification.filter((n) => n !== notif)); // Remove from list
                                setIsNotificationOpen(false); // Close dropdown
                            }}
                            className="px-4 py-3 text-sm text-gray-700 hover:bg-teal-50 cursor-pointer border-b last:border-0 transition"
                        >
                            {notif.chat.isGroupChat
                                ? `New Message in ${notif.chat.chatName}`
                                : `New Message from ${getSender(user, notif.chat.users)}`
                            }
                        </div>
                    ))}
                </div>
            )}
          </div>

          {/* --- PROFILE DROPDOWN --- */}
          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 hover:bg-gray-100 p-1 rounded-lg transition"
            >
              <img 
                src={user.pic} 
                alt={user.name} 
                className="w-8 h-8 rounded-full object-cover border border-gray-300"
              />
              <FaChevronDown className="text-xs text-gray-500" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
                <button 
                  onClick={() => { setShowProfileModal(true); setIsProfileOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  My Profile
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <button 
                  onClick={logoutHandler}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Drawers & Modals */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsSearchOpen(false)}></div>
          <div className="relative bg-white w-80 h-full shadow-xl flex flex-col p-4 animate-slide-in">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">Search Users</h2>
            <div className="flex gap-2 mb-4">
              <input 
                className="border border-gray-300 rounded px-2 py-1 w-full"
                placeholder="Name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button onClick={handleSearch} className="bg-teal-500 text-white px-3 py-1 rounded hover:bg-teal-600">Go</button>
            </div>
            <div className="flex flex-col gap-2 overflow-y-auto">
              {loading ? <div className="text-center mt-4">Loading...</div> : (
                searchResult?.map((user) => (
                  <div key={user._id} onClick={() => accessChat(user._id)} className="flex items-center gap-3 bg-gray-100 p-2 rounded cursor-pointer hover:bg-teal-100">
                    <img src={user.pic} alt={user.name} className="w-8 h-8 rounded-full" />
                    <div>
                      <p className="font-medium text-sm">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {showProfileModal && <ProfileModal user={user} onClose={() => setShowProfileModal(false)} />}
    </>
  );
};

export default SideDrawer;