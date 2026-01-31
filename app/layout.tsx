import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from './layout/authcontent.jsx';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ReImagine Wallpaper APP",
  description: "An AI-powered wallpaper application",
   icons: {
    icon: "/brand.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning 
      >
        <AuthProvider>
          {children}
          </AuthProvider>
      </body>
    </html>
  );
}
