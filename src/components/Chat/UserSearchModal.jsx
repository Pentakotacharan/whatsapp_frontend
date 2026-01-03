import { useState } from "react";
import { ChatState } from "../../context/ChatProvider";
import api from "../../config/api";
import { toast } from "react-toastify";
import { IoClose, IoSearch } from "react-icons/io5";

const UserSearchModal = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);

  const { user, setSelectedChat, chats, setChats } = ChatState();

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
        setSearchResults([]);
        return;
    }

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

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const config = { headers: { "Content-type": "application/json", Authorization: `Bearer ${user.token}` } };
      const { data } = await api.post(`/chat`, { userId }, config);

      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      
      setSelectedChat(data);
      setLoadingChat(false);
      setIsOpen(false); // Close modal
    } catch (error) {
      setLoadingChat(false);
      toast.error("Error fetching the chat");
    }
  };

  return (
    <>
      <span onClick={() => setIsOpen(true)}>{children}</span>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[100]">
          <div className="bg-white p-5 rounded-lg w-full max-w-md shadow-2xl relative h-[500px] flex flex-col">
            
            <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h3 className="text-xl font-bold text-gray-800">New Chat</h3>
                <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-red-500"><IoClose size={24} /></button>
            </div>

            <div className="flex items-center gap-2 bg-gray-100 p-2 rounded mb-4">
                <IoSearch className="text-gray-500" />
                <input 
                    className="bg-transparent outline-none w-full text-sm"
                    placeholder="Search name or email..."
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    autoFocus
                />
            </div>

            <div className="flex-1 overflow-y-auto">
                {loading ? <div className="text-center text-gray-500 mt-5">Searching...</div> : (
                    searchResults.map((u) => (
                        <div 
                            key={u._id} 
                            onClick={() => accessChat(u._id)}
                            className="flex items-center gap-3 p-3 hover:bg-teal-50 cursor-pointer rounded transition border-b border-gray-50 last:border-0"
                        >
                            <img src={u.pic} alt={u.name} className="w-10 h-10 rounded-full border"/>
                            <div>
                                <p className="font-semibold text-gray-800">{u.name}</p>
                                <p className="text-xs text-gray-500">{u.email}</p>
                            </div>
                        </div>
                    ))
                )}
                {!loading && searchResults.length === 0 && search && (
                    <div className="text-center text-gray-400 mt-5">No users found</div>
                )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserSearchModal;