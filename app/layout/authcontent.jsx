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
    setUser(null);
    localStorage.removeItem("auth");
    delete axios.defaults.headers.common["Authorization"];
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