import { useEffect, useRef, useState } from "react";
import socket from "../utils/socket";
import Message from "./Message";
import TypingIndicator from "./TypingIndicator";

export default function ChatWindow({
  user,
  recipient,
  messages,
  isTyping,
  onlineStatus,
  onTyping,
  setMessages,
}) {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle incoming messages
  useEffect(() => {
    const handleReceiveMessage = (newMessage) => {
      if (
        (newMessage.sender === user._id &&
          newMessage.recipient === recipient._id) ||
        (newMessage.sender === recipient._id &&
          newMessage.recipient === user._id)
      ) {
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    socket.on("receive-message", handleReceiveMessage);

    return () => {
      socket.off("receive-message", handleReceiveMessage);
    };
  }, [user._id, recipient._id, setMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit("send-message", {
        senderId: user._id,
        recipientId: recipient._id,
        text: message,
      });
      setMessage("");
      onTyping(false);

      // Clear any active typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleInputChange = (e) => {
    const text = e.target.value;
    setMessage(text);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Update typing status
    const currentlyTyping = text.length > 0;
    onTyping(currentlyTyping);
    socket.emit("typing", {
      senderId: user._id,
      recipientId: recipient._id,
      isTyping: currentlyTyping,
    });

    // Set timeout to stop typing after 2 seconds of inactivity
    if (currentlyTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
        socket.emit("typing", {
          senderId: user._id,
          recipientId: recipient._id,
          isTyping: false,
        });
      }, 2000);
    }
  };

  return (
    <div className="flex flex-col h-full w-1/2 border-r">
      {/* Chat header */}
      <div className="p-4 border-b bg-white sticky top-0 z-10">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-lg font-semibold">
            {recipient.username.charAt(0).toUpperCase()}
          </div>
          <div className="ml-3">
            <h3 className="font-semibold text-gray-800">
              {recipient.username}
            </h3>
            <div className="flex items-center">
              <span
                className={`h-2 w-2 rounded-full ${
                  onlineStatus ? "bg-green-500" : "bg-gray-400"
                }`}
              ></span>
              <span className="ml-2 text-xs text-gray-500">
                {onlineStatus ? "Online" : "Offline"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages container */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-100">
        <div className="space-y-3">
          {messages.map((msg) => (
            <Message
              key={msg._id}
              message={msg}
              isCurrentUser={msg.sender === user._id}
            />
          ))}
          {isTyping && <TypingIndicator username={recipient.username} />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message input */}
      <div className="p-3 border-t bg-white sticky bottom-0">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={handleInputChange}
            onBlur={() => {
              onTyping(false);
              socket.emit("typing", {
                senderId: user._id,
                recipientId: recipient._id,
                isTyping: false,
              });
            }}
            placeholder="Type a message..."
            className="flex-1 p-3 border rounded-full focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300"
          />
          <button
            type="submit"
            className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
