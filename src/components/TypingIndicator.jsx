export default function TypingIndicator({ username }) {
  return (
    <div className="mb-4 flex justify-start">
      <div className="bg-white border p-2 rounded-lg">
        <p className="text-sm text-gray-600">{username} is typing...</p>
      </div>
    </div>
  );
}
