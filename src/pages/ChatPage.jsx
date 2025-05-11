import { useEffect, useRef, useState } from "react";
import { fetchUsers, fetchMessages } from "../utils/api";
import socket from "../utils/socket";
import UserList from "../components/UserList";
import ChatWindow from "../components/ChatWindow";

export default function ChatPage({ user, setUser }) {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineStatus, setOnlineStatus] = useState({});
  const [isTyping, setIsTyping] = useState(false);

  const typingTimeout = useRef();

  useEffect(() => {
    // Fetch all users
    fetchUsers().then((res) => setUsers(res.data));

    // Socket connection
    socket.connect();
    socket.emit("join", user._id);

    // Listen for messages
    // socket.on("receive-message", (message) => {
    //   setMessages((prev) => [...prev, message]);
    // });

    // Listen for typing
    socket.on("typing", ({ senderId, isTyping }) => {
      if (senderId === selectedUser?._id) {
        setIsTyping(isTyping);
      }
    });

    // Listen for online status
    socket.on("user-status", ({ userId, online }) => {
      setOnlineStatus((prev) => ({ ...prev, [userId]: online }));
    });

    return () => {
      // socket.off("receive-message");
      socket.off("typing");
      socket.off("user-status");
      socket.disconnect();
    };
  }, [user, selectedUser]);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(user._id, selectedUser._id).then((res) => {
        setMessages(res.data);
      });
    }
  }, [selectedUser, user._id]);

  // Socket.IO connection and event listeners
  useEffect(() => {
    if (!user) return;

    socket.emit("join", user._id);

    // Listen for user status updates
    socket.on("user-status", ({ userId, online }) => {
      setOnlineStatus((prev) => ({ ...prev, [userId]: online }));
    });

    // Cleanup on unmount
    return () => {
      socket.off("user-status");
    };
  }, [user]);

  // Handle typing events
  const handleTyping = (isTyping) => {
    if (!selectedUser) return;

    // Clear previous timeout
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    // Emit typing event
    socket.emit("typing", {
      senderId: user._id,
      recipientId: selectedUser._id,
      isTyping,
    });

    // Auto-stop typing indicator after 2 seconds
    if (isTyping) {
      typingTimeout.current = setTimeout(() => {
        socket.emit("typing", {
          senderId: user._id,
          recipientId: selectedUser._id,
          isTyping: false,
        });
        setIsTyping(false);
      }, 2000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("chat-user");
    localStorage.removeItem("chat-token");
    setUser(null);
    socket.disconnect();
  };

  return (
    <>
      <div className="flex h-screen bg-gray-100">
        <UserList
          users={users}
          currentUser={user}
          selectedUser={selectedUser}
          onSelectUser={setSelectedUser}
          onlineStatus={onlineStatus}
          handleLogout={handleLogout}
        />
        {selectedUser ? (
          <ChatWindow
            user={user}
            recipient={selectedUser}
            messages={messages}
            isTyping={isTyping}
            onlineStatus={onlineStatus[selectedUser._id]}
            onTyping={handleTyping}
            setMessages={setMessages}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">Select a user to start chatting</p>
          </div>
        )}
      </div>
    </>
  );
}
