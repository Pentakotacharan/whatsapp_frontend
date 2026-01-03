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
            } rounded-lg px-2 py-1 max-w-[75%] mt-1 shadow-sm border border-gray-100 flex flex-col`}
            style={{
              marginLeft: m.sender._id === user._id ? "auto" : "0",
            }}
          >
            {/* --- 1. MEDIA DISPLAY LAYER --- */}
            {/* Image */}
            {m.mediaType === "image" && (
                <img 
                  src={m.mediaUrl} 
                  alt="media" 
                  className="rounded-md max-w-full max-h-[300px] object-cover mb-1 cursor-pointer hover:opacity-95 transition"
                  onClick={() => window.open(m.mediaUrl, "_blank")} // Click to view full size
                />
            )}

            {/* Video */}
            {m.mediaType === "video" && (
                <video 
                  src={m.mediaUrl} 
                  controls 
                  className="rounded-md max-w-full max-h-[300px] mb-1 bg-black"
                />
            )}

            {/* --- 2. TEXT & TICKS LAYER --- */}
            <div className="flex items-end justify-between gap-2 min-w-[60px]">
                
                {/* Message Content (Show if exists, or if fallback text is needed) */}
                {m.content && (
                    <span className="text-sm text-gray-800 leading-relaxed break-words">
                        {m.content}
                    </span>
                )}

                {/* Read Receipts (Only for MY messages) */}
                {m.sender._id === user._id && (
                    <span className="mb-[2px] shrink-0">
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
            </div>
            
          </div>
        </div>
      ))}
    </ScrollableFeed>
  );
};

export default ScrollableChat;