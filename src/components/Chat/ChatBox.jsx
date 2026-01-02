import { ChatState } from "../../context/ChatProvider";
import SingleChat from "./SingleChat";

const ChatBox = () => {
  const { selectedChat } = ChatState();

  return (
    <div
      className={`${
        selectedChat ? "flex" : "hidden"
      } md:flex flex-col items-center p-3 bg-white w-full md:w-[68%] rounded-lg border border-gray-200 h-full`}
    >
      <SingleChat />
    </div>
  );
};

export default ChatBox;