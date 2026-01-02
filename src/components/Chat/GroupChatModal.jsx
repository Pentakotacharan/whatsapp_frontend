import { useState } from "react";
import { ChatState } from "../../context/ChatProvider";
import api from "../../config/api";
import { toast } from "react-toastify";
import { IoClose } from "react-icons/io5";

// Accepts 'children' which is the button we click to open the modal
const GroupChatModal = ({ children }) => {
  // FIX: This must be FALSE so it doesn't open automatically
  const [isOpen, setIsOpen] = useState(false); 
  
  const [groupChatName, setGroupChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const { user, chats, setChats } = ChatState();

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) return;

    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await api.get(`/user?search=${query}`, config);
      setLoading(false);
      setSearchResults(data);
    } catch (error) {
      setLoading(false);
      toast.error("Failed to load search results");
    }
  };

  const handleSubmit = async () => {
    if (!groupChatName || !selectedUsers) {
      toast.warning("Please fill all the fields");
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await api.post(
        "/chat/group",
        {
          name: groupChatName,
          users: JSON.stringify(selectedUsers.map((u) => u._id)),
        },
        config
      );

      setChats([data, ...chats]);
      
      // Emit socket event if you have socket logic
      const io = require("socket.io-client");
      const socket = io("http://localhost:5000");
      socket.emit("new group", data);

      setIsOpen(false); // Close modal on success
      toast.success("New Group Chat Created!");
    } catch (error) {
      toast.error("Failed to create group");
    }
  };

  const handleGroup = (userToAdd) => {
    if (selectedUsers.includes(userToAdd)) {
      toast.warning("User already added");
      return;
    }
    setSelectedUsers([...selectedUsers, userToAdd]);
  };

  const handleDelete = (delUser) => {
    setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id));
  };

  return (
    <>
      {/* 1. THE TRIGGER (The "New Group" Button) */}
      <span onClick={() => setIsOpen(true)}>
        {children}
      </span>

      {/* 2. THE MODAL (Only shows if isOpen is true) */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[100]">
          <div className="bg-white p-5 rounded-lg w-full max-w-md shadow-2xl animate-fade-in relative">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Create Group Chat</h3>
                <button 
                    onClick={() => setIsOpen(false)}
                    className="text-gray-500 hover:text-red-500 transition"
                >
                    <IoClose size={24} />
                </button>
            </div>

            {/* Group Name Input */}
            <div className="mb-4">
                <input 
                    className="w-full border border-gray-300 p-2 rounded focus:border-teal-500 outline-none"
                    placeholder="Group Name"
                    onChange={(e) => setGroupChatName(e.target.value)}
                />
            </div>

            {/* User Search Input */}
            <div className="mb-4">
                <input 
                    className="w-full border border-gray-300 p-2 rounded focus:border-teal-500 outline-none"
                    placeholder="Add Users (eg: John, Jane)"
                    onChange={(e) => handleSearch(e.target.value)}
                />
            </div>

            {/* Selected Users Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
                {selectedUsers.map((u) => (
                    <div key={u._id} className="bg-teal-100 text-teal-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        {u.name}
                        <IoClose 
                            className="cursor-pointer hover:text-red-500" 
                            onClick={() => handleDelete(u)}
                        />
                    </div>
                ))}
            </div>

            {/* Search Results */}
            <div className="max-h-40 overflow-y-auto mb-4 border rounded p-1">
                {loading ? (
                    <div className="text-center text-sm text-gray-500">Loading...</div>
                ) : (
                    searchResults?.slice(0, 4).map((user) => (
                        <div 
                            key={user._id} 
                            onClick={() => handleGroup(user)}
                            className="flex items-center gap-2 p-2 hover:bg-teal-50 cursor-pointer rounded transition"
                        >
                            <img src={user.pic} alt={user.name} className="w-8 h-8 rounded-full"/>
                            <div>
                                <p className="text-sm font-medium">{user.name}</p>
                                <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create Button */}
            <button 
                onClick={handleSubmit}
                className="w-full bg-teal-600 text-white py-2 rounded hover:bg-teal-700 font-semibold"
            >
                Create Chat
            </button>

          </div>
        </div>
      )}
    </>
  );
};

export default GroupChatModal;