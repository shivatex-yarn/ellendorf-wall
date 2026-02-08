"use client";

import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
  return (
    <Toaster 
      position="top-center"
      toastOptions={{
        duration: 5000,
        style: {
          background: '#10b981',
          color: '#fff',
          padding: '16px 24px',
          borderRadius: '12px',
          fontSize: '16px',
          fontWeight: '500',
        },
      }}
    />
  );
}
