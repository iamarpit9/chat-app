export default function Message({ message, isCurrentUser }) {
  return (
    <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isCurrentUser
            ? "bg-blue-500 text-white rounded-tr-none"
            : "bg-white text-gray-800 rounded-tl-none shadow-sm"
        }`}
      >
        <p>{message.text}</p>
        <p
          className={`text-xs mt-1 text-right ${
            isCurrentUser ? "text-blue-100" : "text-gray-500"
          }`}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}
