"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/layout/authcontent";

export default function ProtectedRoute({ children }) {
  const { loadingUser, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth to finish loading, then check authentication
    if (!loadingUser && !isAuthenticated) {
      router.push("/auth");
    }
  }, [loadingUser, isAuthenticated, router]);

  // Show loading while checking auth
  if (loadingUser) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-xl text-blue-700">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show redirecting message (redirect will happen via useEffect)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-xl text-blue-700">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // User is authenticated, render children
  return <>{children}</>;
}
