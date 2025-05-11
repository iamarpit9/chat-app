import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import socket from "./utils/socket";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ChatPage from "./pages/ChatPage";
import { login } from "./utils/api";

export default function App() {
  const [user, setUser] = useState(null); // Current logged-in user
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    socket.emit("join", user._id);

    // Cleanup on unmount
    return () => {
      socket.off("user-status");
    };
  }, [user]);

  // Check if user is authenticated
  useEffect(() => {
    const storedUser = localStorage.getItem("chat-user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      socket.connect();
      socket.emit("join", JSON.parse(storedUser)._id);
    }
    setLoading(false);
  }, []);

  // Handle login
  const handleLogin = async (userData) => {
    try {
      const response = await login(userData);

      localStorage.setItem("chat-user", JSON.stringify(response.data.user));
      localStorage.setItem("chat-token", response.data.token);

      // Connect socket with authenticated user
      socket.auth = { token: response.data.token };
      socket.connect();
      setUser(response.data.user);

      return { success: true, user: response.data.user };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || "Login failed",
      };
    }
  };

  // Handle Register
  const handleRegister = async (userData) => {
    try {
      const response = await login(userData);

      localStorage.setItem("chat-user", JSON.stringify(response.data.user));
      localStorage.setItem("chat-token", response.data.token);

      // Connect socket with authenticated user
      socket.auth = { token: response.data.token };
      socket.connect();
      setUser(response.data.user);

      return response.data.user;
    } catch (err) {
      throw err.response?.data?.message || "Registration failed";
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("chat-user");
    setUser(null);
    socket.disconnect();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            !user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />
          }
        />
        <Route
          path="/register"
          element={
            !user ? (
              <Register onRegister={handleRegister} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* Private Route (Chat) */}
        <Route
          path="/"
          element={
            user ? (
              <ChatPage user={user} setUser={setUser} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}
