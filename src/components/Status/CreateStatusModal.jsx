import { useState } from "react";
import { toast } from "react-toastify";
import api from "../../config/api";
import { ChatState } from "../../context/ChatProvider";
import io from "socket.io-client";

const CreateStatusModal = ({ onClose, onSuccess }) => {
  const [mediaUrl, setMediaUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = ChatState();
  const ENDPOINT = "https://whatsapp-backend-rho-sepia.vercel.app"; // Ensure this matches
   var socket = io(ENDPOINT);
  const handleSubmit = async () => {
    if (!mediaUrl) {
      toast.warning("Please enter an image URL");
      return;
    }

    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      const { data } = await api.post("/status", { mediaUrl, caption }, config);
      
      // FIX: Use the 'io' import, NOT require
      const socket = io("https://whatsapp-backend-rho-sepia.vercel.app"); 
      socket.emit("new status", data); 

      setLoading(false);
      toast.success("Status Uploaded!");
      onSuccess(); 
      onClose();   
    } catch (error) {
      setLoading(false);
      console.error(error);
      toast.error("Failed to upload status");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[100]">
      <div className="bg-white p-5 rounded-lg w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Add to Status</h2>
        
        <label className="text-sm text-gray-600">Image URL</label>
        <input 
          className="w-full border p-2 mb-3 rounded focus:outline-teal-500"
          placeholder="https://example.com/image.jpg"
          value={mediaUrl}
          onChange={(e) => setMediaUrl(e.target.value)}
        />

        <label className="text-sm text-gray-600">Caption (Optional)</label>
        <input 
          className="w-full border p-2 mb-4 rounded focus:outline-teal-500"
          placeholder="What's on your mind?"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button 
            onClick={onClose} 
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={loading}
            className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 disabled:bg-gray-400"
          >
            {loading ? "Posting..." : "Share"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateStatusModal;