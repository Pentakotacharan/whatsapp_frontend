import { useState } from "react";
import { ChatState } from "../../context/ChatProvider";
import api from "../../config/api";
import { IoClose, IoChatbubbleEllipsesSharp, IoLogOut, IoTrash } from "react-icons/io5";
import { toast } from "react-toastify";

const GroupInfoModal = ({ onClose }) => {
  const { user, selectedChat, setSelectedChat, chats, setChats } = ChatState();
  const [loading, setLoading] = useState(false);

  // 1. EXIT GROUP LOGIC
  const handleExitGroup = async () => {
    if (!window.confirm("Are you sure you want to exit this group?")) return;

    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      await api.put("/chat/groupexit", { chatId: selectedChat._id }, config);
      
      // Update local state: Remove this chat from the sidebar list
      setChats(chats.filter((c) => c._id !== selectedChat._id));
      setSelectedChat(""); // Close the chat window
      setLoading(false);
      onClose();
      toast.success("You left the group");
    } catch (error) {
      setLoading(false);
      toast.error("Failed to exit group");
    }
  };

  // 2. DELETE GROUP LOGIC (Admin Only)
  const handleDeleteGroup = async () => {
    if (!window.confirm("Are you sure you want to permanently delete this group?")) return;

    try {
      setLoading(true);
      const config = { 
        headers: { Authorization: `Bearer ${user.token}` },
        data: { chatId: selectedChat._id } // DELETE requests send body in 'data'
      };
      
      await api.delete("/chat/delete", config);

      setChats(chats.filter((c) => c._id !== selectedChat._id));
      setSelectedChat("");
      setLoading(false);
      onClose();
      toast.error("Group Deleted");
    } catch (error) {
      setLoading(false);
      toast.error("Failed to delete group");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[100]">
      <div className="bg-white w-full max-w-md rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="bg-teal-600 p-4 flex justify-between items-center text-white">
          <h2 className="text-xl font-bold">{selectedChat.chatName}</h2>
          <button onClick={onClose}><IoClose size={24} /></button>
        </div>

        {/* Group Info */}
        <div className="p-4 bg-gray-50 border-b">
            <p className="text-gray-600 text-sm">
                Admin: <span className="font-semibold">{selectedChat.groupAdmin?.name}</span>
            </p>
            <p className="text-gray-500 text-xs mt-1">
                {selectedChat.users.length} Participants
            </p>
        </div>

        {/* Member List */}
        <div className="flex-1 overflow-y-auto p-2">
            {selectedChat.users.map((u) => (
                <div key={u._id} className="flex items-center justify-between p-3 hover:bg-gray-100 rounded-lg transition">
                    <div className="flex items-center gap-3">
                        <img src={u.pic} alt={u.name} className="w-10 h-10 rounded-full border border-gray-300"/>
                        <div>
                            <p className="font-semibold text-gray-800 flex items-center gap-2">
                                {u.name}
                                {selectedChat.groupAdmin._id === u._id && <span className="text-[10px] bg-green-100 text-green-700 px-1 rounded">Admin</span>}
                                {user._id === u._id && <span className="text-[10px] bg-gray-200 text-gray-600 px-1 rounded">You</span>}
                            </p>
                            <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {/* --- FOOTER ACTIONS --- */}
        <div className="p-4 border-t border-gray-200 flex flex-col gap-2 bg-gray-50">
            
            {/* Button 1: Exit Group (Visible to All) */}
            <button 
                onClick={handleExitGroup}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-red-100 text-red-600 py-2 rounded hover:bg-red-200 transition font-medium"
            >
                <IoLogOut size={20} /> Exit Group
            </button>

            {/* Button 2: Delete Group (Visible ONLY to Admin) */}
            {selectedChat.groupAdmin._id === user._id && (
                <button 
                    onClick={handleDeleteGroup}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300 transition text-sm"
                >
                    <IoTrash size={18} /> Delete Group for Everyone
                </button>
            )}
        </div>

      </div>
    </div>
  );
};

export default GroupInfoModal;