import { useEffect } from "react";
import { socket } from "../services/socket";
import { ChatState } from "../context/ChatProvider";

const useSocket = () => {
  const { user } = ChatState();

  useEffect(() => {
    if (user) {
      socket.connect();
      socket.emit("setup", user);
    }

    // Cleanup on unmount or logout
    return () => {
      socket.disconnect();
    };
  }, [user]);

  return socket;
};

export default useSocket;