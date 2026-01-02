import { useEffect, useState } from "react";
import api from "../../config/api";
import { ChatState } from "../../context/ChatProvider";
import { toast } from "react-toastify";
import { FaUsers } from "react-icons/fa";

const CommunityList = () => {
  const [communities, setCommunities] = useState([]);
  const { user, setSelectedChat } = ChatState();

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        
        // FIX: Change "/api/community" to just "/community"
        const { data } = await api.get("/community", config);
        
        setCommunities(data);
      } catch (error) {
        console.error("Failed to load communities");
      }
    };

    if (user) fetchCommunities();
  }, [user]);

  return (
    <div className="flex flex-col gap-3 h-full overflow-y-scroll no-scrollbar">
      {communities.length > 0 ? (
        communities.map((chat) => (
          <div
            key={chat._id}
            onClick={() => setSelectedChat(chat)}
            className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-100 cursor-pointer hover:bg-teal-50 transition shadow-sm"
          >
            {/* Community Icon */}
            <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-lg flex items-center justify-center text-xl">
              <FaUsers />
            </div>
            
            {/* Community Info */}
            <div className="flex flex-col">
              <span className="font-bold text-gray-800 capitalize">{chat.chatName}</span>
              <span className="text-xs text-gray-500">
                {chat.users.length} Members
              </span>
            </div>
          </div>
        ))
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-gray-400 mt-10">
          <FaUsers size={40} className="mb-2 opacity-50"/>
          <p>No Communities found</p>
          <p className="text-xs">Create a Group to see it here.</p>
        </div>
      )}
    </div>
  );
};

export default CommunityList;