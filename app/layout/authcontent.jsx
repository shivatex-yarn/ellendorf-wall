"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const stored = localStorage.getItem("auth");
        if (stored) {
          const parsed = JSON.parse(stored);
          setUser(parsed);
          if (parsed?.token) {
            axios.defaults.headers.common["Authorization"] = `Bearer ${parsed.token}`;
          }
        }
      } catch (err) {
        console.error("Failed to load auth data", err);
        localStorage.removeItem("auth");
      } finally {
        setLoadingUser(false);
      }
    };

    initAuth();
  }, []);

  const login = (userData) => {
    const userWithToken = { ...userData };
    setUser(userWithToken);
    localStorage.setItem("auth", JSON.stringify(userWithToken));
    if (userWithToken.token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${userWithToken.token}`;
    }
  };

  const logout = () => {
    // Get user ID before clearing user state
    const userId = user?.id;
    
    setUser(null);
    localStorage.removeItem("auth");
    delete axios.defaults.headers.common["Authorization"];
    
    // Clear user-specific shortlisted images from sessionStorage
    if (userId) {
      try {
        sessionStorage.removeItem(`likedWallpapers_${userId}`);
      } catch (err) {
        console.error("Failed to clear liked wallpapers from sessionStorage on logout:", err);
      }
    }
    
    // Also clear any legacy sessionStorage items
    try {
      sessionStorage.removeItem("likedWallpapers");
    } catch (err) {
      console.error("Failed to clear liked wallpapers from sessionStorage on logout:", err);
    }
    
    // Dispatch custom event for immediate clearing in components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('userLogout', { detail: { userId } }));
    }
  };

  const value = {
    user,
    loadingUser,
    login,
    logout,
    isAuthenticated: !!user,
    isSuperadmin: user?.role === "superadmin",
    isAdmin: user?.role === "admin",
    canViewAllBranches: () => user?.role === "superadmin",
    getCurrentBranchId: () => user?.branchId,
    isAdminOrHigher: () => ["admin", "superadmin"].includes(user?.role),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};