'use client';

import React from 'react';
import Sidebar from '../sidebar/page.jsx'; 

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 ml-0 sm:ml-64 p-4 overflow-y-auto">{children}</main>
    </div>
  );
}
