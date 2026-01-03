import { useState } from "react";
import { ChatState } from "../../context/ChatProvider";
import api from "../../config/api";
import { toast } from "react-toastify";
import { IoClose } from "react-icons/io5";

const CreateCommunityModal = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [image, setImage] = useState(""); // URL logic same as Profile
  const [loading, setLoading] = useState(false);

  const { user } = ChatState();

  const handleSubmit = async () => {
    if (!name || !desc) {
      toast.warning("Name and Description are required");
      return;
    }

    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      // Assuming your backend has this route. If not, you need to create it.
      await api.post("/community", { name, description: desc, image }, config);

      setLoading(false);
      setIsOpen(false);
      toast.success("Community Created!");
      // Ideally, trigger a refresh of the community list here
      window.location.reload(); 
    } catch (error) {
      setLoading(false);
      toast.error("Failed to create community");
    }
  };

  return (
    <>
      <span onClick={() => setIsOpen(true)}>{children}</span>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[100]">
          <div className="bg-white p-5 rounded-lg w-full max-w-md shadow-xl relative">
            <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-red-500"><IoClose size={24} /></button>
            <h3 className="text-xl font-bold mb-4 text-gray-800">Create Community</h3>

            <input 
                className="w-full border p-2 rounded mb-3 outline-none focus:border-teal-500"
                placeholder="Community Name"
                onChange={(e) => setName(e.target.value)}
            />
             <textarea 
                className="w-full border p-2 rounded mb-3 outline-none focus:border-teal-500"
                placeholder="Description..."
                rows="3"
                onChange={(e) => setDesc(e.target.value)}
            />
            <input 
                className="w-full border p-2 rounded mb-4 outline-none focus:border-teal-500 text-sm"
                placeholder="Image URL (Optional)"
                onChange={(e) => setImage(e.target.value)}
            />

            <button 
                onClick={handleSubmit} 
                disabled={loading}
                className="w-full bg-teal-600 text-white py-2 rounded font-semibold hover:bg-teal-700 disabled:opacity-50"
            >
                {loading ? "Creating..." : "Create Community"}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateCommunityModal;