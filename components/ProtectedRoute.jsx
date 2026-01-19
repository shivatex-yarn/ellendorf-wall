"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/layout/authcontent";

export default function ProtectedRoute({ children }) {
  const { user, loadingUser, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loadingUser && !isAuthenticated) {
      router.push("/auth");
    }
  }, [user, loadingUser, isAuthenticated, router]);

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

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
