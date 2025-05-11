import { formatLastSeen } from "../utils/date";

export default function UserList({
  users,
  currentUser,
  selectedUser,
  onSelectUser,
  onlineStatus,
  handleLogout,
}) {
  return (
    <div className="w-1/4 border-r bg-white">
      <button
        onClick={handleLogout}
        className="text-gray-500 hover:text-gray-700 transition-colors m-5"
        title="Logout"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
      </button>
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">Users</h2>
      </div>
      <div className="overflow-y-auto">
        {users
          .filter((u) => u._id !== currentUser._id)
          .map((user) => (
            <div
              key={user._id}
              onClick={() => onSelectUser(user)}
              className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                selectedUser?._id === user._id ? "bg-blue-50" : ""
              }`}
            >
              <div className="flex items-center">
                <span className="font-medium">{user.username}</span>
                <span
                  className={`ml-2 h-2 w-2 rounded-full ${
                    onlineStatus[user._id] ? "bg-green-500" : "bg-gray-400"
                  }`}
                ></span>
              </div>
              <p className="text-sm text-gray-500">
                {onlineStatus[user._id]
                  ? "Online"
                  : `Last seen ${formatLastSeen(user.lastSeen)}`}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
}
