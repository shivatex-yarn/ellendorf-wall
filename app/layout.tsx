import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from './layout/authcontent.jsx';
import ToastProvider from './components/ToastProvider';
import ImageGuard from './components/ImageGuard';

// Primary UI typeface — a modern, premium geometric sans.
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
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
      <body className={`${jakarta.variable} ${geistMono.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <ImageGuard />
          {children}
          <ToastProvider />
        </AuthProvider>
      </body>
    </html>
  );
}
