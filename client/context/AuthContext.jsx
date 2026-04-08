/* eslint-disable react-refresh/only-export-components */
import axios from "axios";
import { createContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
export const AuthContext = createContext();
axios.defaults.baseURL = backendUrl;
axios.defaults.withCredentials = true;

export const AuthProvider = ({ children }) => {
  // Remove token state, use only authUser
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isGeneratingRecoveryCode, setIsGeneratingRecoveryCode] = useState(false);
  // check if user is authenticated if so set the user data and connect the socket
  const checkAuth = async () => {
    try {
      const { data } = await axios.get("/api/auth/check");
      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
      } else {
        setAuthUser(null);
      }
    } catch (error) {
      setAuthUser(null);
      // Suppress 401 errors on initial load
      if (error.response?.status !== 401) {
        toast.error(error.message);
      }
    } finally {
      setIsAuthLoading(false);
    }
  };
  // Login function to handle user authentication and socket connection
  const login = async (state, credentials) => {
    try {
      const { data } = await axios.post(`/api/auth/${state}`, credentials, { withCredentials: true });
      if (data.success) {
        setAuthUser(data.userData);
        connectSocket(data.userData);
        toast.success(data.message);
        return data;
      } else {
        toast.error(data.message);
        return false;
      }
    } catch (error) {
      toast.error(error.message);
      return false;
    }
  };

  const generateRecoveryCode = async () => {
    try {
      setIsGeneratingRecoveryCode(true);
      const { data } = await axios.post("/api/auth/recovery-code", {}, { withCredentials: true });
      if (data.success) {
        toast.success(data.message);
        return data.recoveryCode;
      }
      toast.error(data.message);
      return null;
    } catch (error) {
      toast.error(error.message);
      return null;
    } finally {
      setIsGeneratingRecoveryCode(false);
    }
  };

  // Logout function to handle user logout and socket disconnection
  const logout = async () => {
    try {
      await axios.post("/api/auth/logout", {}, { withCredentials: true });
    } catch (error) {
      console.warn("Logout request failed:", error.message);
    }
    setAuthUser(null);
    setOnlineUsers([]);
    toast.success("Logged out successfully");
    socket?.disconnect();
    setSocket(null);
  };
  // update profile function to handle user profile updates
  const updateProfile = async (body) => {
    try {
      setIsUpdatingProfile(true);
      const { data } = await axios.put("/api/auth/update-profile", body, { withCredentials: true });
      if (data.success) {
        // Refresh user data after update
        const refreshed = await axios.get("/api/auth/check");
        setAuthUser(refreshed.data.user);
        toast.success("Profile updated successfully");
        return true;
      }
      toast.error(data.message);
      return false;
    } catch (error) {
      toast.error(error.message);
      return false;
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const updateSkillsProfile = async (body) => {
    try {
      const { data } = await axios.put("/api/auth/skills-profile", body, { withCredentials: true });
      if (data.success) {
        const refreshed = await axios.get("/api/auth/check");
        setAuthUser(refreshed.data.user);
        return { success: true, data };
      }
      return { success: false, message: data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  };

  // connect socket function to handle socket connection and user update
  const connectSocket = (userData) => {
    if (!userData || socket?.connected) return;
    const newSocket = io(backendUrl, {
      autoConnect: false,
      query: {
        userId: userData._id,
      },
    });
    newSocket.on("getOnlineUsers", (userIds) => {
      setOnlineUsers(userIds.map(String));
    });
    newSocket.connect();
    setSocket(newSocket);
  };
  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line
  }, []);
  const value = {
    axios,
    authUser,
    onlineUsers,
    socket,
    login,
    logout,
    updateProfile,
    updateSkillsProfile,
    generateRecoveryCode,
    isAuthLoading,
    isUpdatingProfile,
    isGeneratingRecoveryCode,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
