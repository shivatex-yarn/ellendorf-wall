"use client";

import React from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import SidebarLayout from "../layout/sidebarlayout";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <SidebarLayout>{children}</SidebarLayout>
    </ProtectedRoute>
  );
}
