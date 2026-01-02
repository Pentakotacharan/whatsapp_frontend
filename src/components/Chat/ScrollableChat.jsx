import ScrollableFeed from "react-scrollable-feed";
import { ChatState } from "../../context/ChatProvider";
import { IoCheckmark, IoCheckmarkDone } from "react-icons/io5";

const ScrollableChat = ({ messages }) => {
  const { user } = ChatState();

  return (
    <ScrollableFeed>
      {messages && messages.map((m, i) => (
        <div className="flex" key={m._id}>
          <div
            className={`${
              m.sender._id === user._id ? "bg-[#d9fdd3]" : "bg-white"
            } rounded-lg px-2 py-1 max-w-[75%] mt-1 shadow-sm border border-gray-100 flex items-end gap-2`}
            style={{
              marginLeft: m.sender._id === user._id ? "auto" : "0",
            }}
          >
            {/* Message Content */}
            <span className="text-sm text-gray-800 leading-relaxed break-words">
                {m.content}
            </span>

            {/* Read Receipts (Only for MY messages) */}
            {m.sender._id === user._id && (
                <span className="mb-[2px]">
                    {/* Logic: If 'readBy' has someone other than me, it is SEEN */}
                    {m.readBy && m.readBy.some(u => u !== user._id) ? (
                        // Blue Double Tick (Seen)
                        <IoCheckmarkDone className="text-blue-500 text-[16px]" />
                    ) : (
                        // Grey Single Tick (Sent)
                        <IoCheckmark className="text-gray-400 text-[16px]" />
                    )}
                </span>
            )}
            
            {/* Optional: Time (If you want to add it later) */}
             {/* <span className="text-[10px] text-gray-500 mb-[2px]">
                {new Date(m.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
             </span> */}
          </div>
        </div>
      ))}
    </ScrollableFeed>
  );
};

export default ScrollableChat;