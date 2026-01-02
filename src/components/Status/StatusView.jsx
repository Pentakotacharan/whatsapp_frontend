import { useEffect, useState } from "react";
import api from "../../config/api";
import { ChatState } from "../../context/ChatProvider";
import { FaPlus } from "react-icons/fa";
import CreateStatusModal from "./CreateStatusModal";
import StatusModal from "./StatusModal"; 
import io from "socket.io-client";

const ENDPOINT = "http://localhost:5000";
var socket;

const StatusView = () => {
  const [statuses, setStatuses] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingStatusList, setViewingStatusList] = useState(null); // Passing a LIST now
  const { user } = ChatState();

  const fetchStatuses = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await api.get("/status", config);
      setStatuses(data);
    } catch (error) {
      console.error("Failed to fetch statuses");
    }
  };

  useEffect(() => {
    if(user) {
        fetchStatuses();
        socket = io(ENDPOINT);
        socket.emit("setup", user);
        socket.on("status received", (newStatus) => {
            setStatuses((prev) => [newStatus, ...prev]);
        });
    }
  }, [user]);

  // --- LOGIC TO GROUP STATUSES BY USER ---
  const groupStatuses = () => {
    const grouped = {};
    
    statuses.forEach((status) => {
      const userId = status.user._id;
      if (!grouped[userId]) {
        grouped[userId] = {
           user: status.user,
           statusList: [] 
        };
      }
      grouped[userId].statusList.push(status);
    });

    // Ensure statuses are in time order (Oldest -> Newest) for the slideshow
    Object.keys(grouped).forEach(key => {
        grouped[key].statusList.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    });

    return grouped;
  };

  const groupedData = groupStatuses();
  
  // Extract "My" data vs "Others" data
  const myData = groupedData[user?._id];
  const otherUsers = Object.values(groupedData).filter(group => group.user._id !== user?._id);

  return (
    <>
      <div className="flex items-center overflow-x-scroll p-3 bg-white border-b border-gray-200 no-scrollbar gap-4">
        
        {/* --- SECTION 1: MY STATUS --- */}
        <div 
          className="flex flex-col items-center cursor-pointer min-w-[60px]"
          onClick={() => {
            if (myData) setViewingStatusList(myData.statusList); // View my list
            else setShowCreateModal(true); // Or create new
          }}
        >
          <div className={`relative w-[60px] h-[60px] rounded-full ${myData ? "border-[3px] border-teal-500 p-[2px]" : ""}`}>
             <img 
               // Show latest status image or profile pic
               src={myData ? myData.statusList[myData.statusList.length - 1].mediaUrl : user?.pic} 
               alt="My Status" 
               className="w-full h-full rounded-full object-cover border border-gray-300 opacity-90"
             />
             {!myData && (
               <div className="absolute bottom-0 right-0 bg-teal-600 text-white rounded-full p-1 border-2 border-white text-xs">
                 <FaPlus />
               </div>
             )}
          </div>
          <p className="text-xs mt-1 font-medium text-gray-800">My Status</p>
        </div>

        {/* Small Add Button if I have status */}
        {myData && (
            <div onClick={() => setShowCreateModal(true)} className="flex flex-col justify-center items-center cursor-pointer opacity-50 hover:opacity-100">
                <div className="bg-gray-200 rounded-full p-2 text-teal-600"><FaPlus /></div>
            </div>
        )}

        <div className="w-[1px] h-10 bg-gray-300 mx-1"></div>

        {/* --- SECTION 2: OTHERS --- */}
        {otherUsers.map((group) => (
            <div 
                key={group.user._id} 
                className="flex flex-col items-center cursor-pointer min-w-[60px]"
                onClick={() => setViewingStatusList(group.statusList)} // Pass the whole list
            >
              <div className="w-[60px] h-[60px] rounded-full border-[3px] border-teal-500 p-[2px] hover:scale-105 transition-transform">
                 <img 
                   // Show their latest status as the thumbnail
                   src={group.statusList[group.statusList.length - 1].mediaUrl} 
                   alt={group.user.name} 
                   className="w-full h-full object-cover rounded-full"
                 />
              </div>
              <p className="text-xs mt-1 text-gray-700 truncate w-16 text-center font-medium">
                {group.user.name.split(" ")[0]}
              </p>
            </div>
        ))}
        
        {otherUsers.length === 0 && (
            <p className="text-xs text-gray-400 italic mt-2">No updates</p>
        )}
      </div>

      {/* --- MODALS --- */}
      {showCreateModal && (
        <CreateStatusModal 
          onClose={() => setShowCreateModal(false)} 
          onSuccess={fetchStatuses} 
        />
      )}

      {viewingStatusList && (
        <StatusModal 
            statusList={viewingStatusList} // Passing ARRAY now
            onClose={() => setViewingStatusList(null)} 
        />
      )}
    </>
  );
};

export default StatusView;