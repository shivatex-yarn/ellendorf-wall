"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const AuthContext = createContext(undefined);

// --- Security / auto-logout configuration ---
const IDLE_TIMEOUT_MS = 10 * 60 * 1000; // auto-logout after 10 minutes of inactivity
const WARNING_BEFORE_MS = 60 * 1000; // warn the user 1 minute before logout
const ACTIVITY_THROTTLE_MS = 5 * 1000; // throttle how often we persist activity
const LAST_ACTIVITY_KEY = "auth:lastActivity"; // shared idle timestamp (cross-tab)
const IDLE_LOGOUT_TOAST_ID = "idle-logout";
const IDLE_WARNING_TOAST_ID = "idle-warning";

// Activity signals that count as the user being "present"
const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
  "click",
  "wheel",
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Timer + bookkeeping refs (kept out of state to avoid re-renders on every tick)
  const logoutTimerRef = useRef(null);
  const warningTimerRef = useRef(null);
  const lastPersistRef = useRef(0);
  const isAuthedRef = useRef(false);

  const clearIdleTimers = useCallback(() => {
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    logoutTimerRef.current = null;
    warningTimerRef.current = null;
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const stored = localStorage.getItem("auth");
        if (stored) {
          const parsed = JSON.parse(stored);

          // Security: if the stored session has already been idle past the
          // timeout (e.g. tab was left closed / machine asleep), reject it.
          const lastActivity = Number(localStorage.getItem(LAST_ACTIVITY_KEY));
          if (lastActivity && Date.now() - lastActivity > IDLE_TIMEOUT_MS) {
            localStorage.removeItem("auth");
            localStorage.removeItem(LAST_ACTIVITY_KEY);
          } else {
            setUser(parsed);
            if (parsed?.token) {
              axios.defaults.headers.common["Authorization"] = `Bearer ${parsed.token}`;
            }
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
    localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
    if (userWithToken.token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${userWithToken.token}`;
    }
  };

  const logout = (reason) => {
    // Get user ID before clearing user state
    const userId = user?.id;

    clearIdleTimers();
    toast.dismiss(IDLE_WARNING_TOAST_ID);

    setUser(null);
    localStorage.removeItem("auth");
    localStorage.removeItem(LAST_ACTIVITY_KEY);
    delete axios.defaults.headers.common["Authorization"];

    // Also clear the per-session token copy used elsewhere in the app
    try {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("userId");
      sessionStorage.removeItem("branchId");
      sessionStorage.removeItem("userRole");
    } catch (err) {
      console.error("Failed to clear session storage on logout:", err);
    }

    if (reason === "idle" && typeof window !== "undefined") {
      toast.error("You have been logged out due to inactivity.", {
        id: IDLE_LOGOUT_TOAST_ID,
        duration: 5000,
        position: "top-center",
      });
    }

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

      // Idle timeouts happen without a click, so force the user to the login
      // screen here. Manual logout handles its own navigation in the caller.
      if (reason === "idle") {
        window.location.replace("/auth");
      }
    }
  };

  // Keep the latest logout available to event listeners without re-binding them
  const logoutRef = useRef(logout);
  logoutRef.current = logout;

  // --- Auto-logout on inactivity + cross-tab session sync ---
  useEffect(() => {
    isAuthedRef.current = !!user;
    if (!user) {
      clearIdleTimers();
      return;
    }

    const triggerIdleLogout = () => {
      clearIdleTimers();
      logoutRef.current("idle");
    };

    const showIdleWarning = () => {
      toast("Session expiring soon — move your mouse or press a key to stay signed in.", {
        id: IDLE_WARNING_TOAST_ID,
        icon: "⚠️",
        duration: WARNING_BEFORE_MS,
        position: "top-center",
        style: {
          background: "linear-gradient(to right, #b45309, #f59e0b)",
          color: "#fff",
          borderRadius: "12px",
          padding: "14px 20px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
        },
      });
    };

    const scheduleTimers = () => {
      clearIdleTimers();
      toast.dismiss(IDLE_WARNING_TOAST_ID);
      warningTimerRef.current = setTimeout(showIdleWarning, IDLE_TIMEOUT_MS - WARNING_BEFORE_MS);
      logoutTimerRef.current = setTimeout(triggerIdleLogout, IDLE_TIMEOUT_MS);
    };

    const registerActivity = () => {
      const now = Date.now();
      // Throttle persistence + timer resets so we don't thrash on every mousemove
      if (now - lastPersistRef.current < ACTIVITY_THROTTLE_MS) return;
      lastPersistRef.current = now;
      try {
        localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
      } catch (err) {
        console.error("Failed to persist activity timestamp:", err);
      }
      scheduleTimers();
    };

    // Cross-tab sync: react to auth/activity changes made in other tabs
    const handleStorage = (e) => {
      if (e.key === "auth" && e.newValue === null && isAuthedRef.current) {
        // Logged out elsewhere — mirror it here without redirect loops
        clearIdleTimers();
        setUser(null);
        delete axios.defaults.headers.common["Authorization"];
        return;
      }
      if (e.key === LAST_ACTIVITY_KEY && e.newValue) {
        // Activity happened in another tab — keep this tab's timer in sync
        lastPersistRef.current = Number(e.newValue);
        scheduleTimers();
      }
    };

    // On mount/login: honor any idle time already elapsed before this render
    const lastActivity = Number(localStorage.getItem(LAST_ACTIVITY_KEY));
    if (lastActivity && Date.now() - lastActivity > IDLE_TIMEOUT_MS) {
      triggerIdleLogout();
      return;
    }

    scheduleTimers();
    ACTIVITY_EVENTS.forEach((evt) =>
      window.addEventListener(evt, registerActivity, { passive: true })
    );
    window.addEventListener("storage", handleStorage);

    return () => {
      clearIdleTimers();
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, registerActivity));
      window.removeEventListener("storage", handleStorage);
    };
  }, [user, clearIdleTimers]);

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