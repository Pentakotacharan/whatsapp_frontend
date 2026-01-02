import { ChatState } from "../context/ChatProvider";
import SideDrawer from "../components/UI/SideDrawer";
import MyChats from "../components/Chat/MyChats";
import SingleChat from "../components/Chat/SingleChat";
import { useState } from "react";

const ChatPage = () => {
  const { user, selectedChat } = ChatState(); // <--- 1. Get selectedChat
  const [fetchAgain, setFetchAgain] = useState(false);

  return (
    <div className="w-full h-screen overflow-hidden bg-gray-50 flex flex-col">
      {/* Top Navigation */}
      {user && <SideDrawer />}

      {/* Main Content Area */}
      <div 
        className="flex justify-between w-full flex-1 overflow-hidden p-0 md:p-3 gap-0 md:gap-3"
      >
        
        {/* Left Side (Chats List) */}
        {/* MyChats handles its own visibility (hidden on mobile when chat is open) */}
        {user && <MyChats fetchAgain={fetchAgain} />}
        
        {/* Right Side (Chat Window) */}
        {user && (
          <div 
            className={`
              h-full transition-all duration-300 
              md:w-[69%] 
              ${selectedChat ? "w-full" : "hidden md:block"} /* <--- 2. Hide wrapper on mobile if no chat */
            `}
          >
             <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;