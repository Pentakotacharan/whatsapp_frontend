import { IoClose } from "react-icons/io5";

const UserBadgeItem = ({ user, handleFunction }) => {
  return (
    <div
      onClick={handleFunction}
      className="px-2 py-1 rounded-lg m-1 mb-2 text-xs bg-purple-500 text-white cursor-pointer flex items-center hover:bg-purple-600 transition"
    >
      {user.name}
      <IoClose className="ml-1" />
    </div>
  );
};

export default UserBadgeItem;