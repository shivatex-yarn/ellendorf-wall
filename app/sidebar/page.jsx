'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Palette,
  FileImage,
  Package,
  Sparkles,
  LogOut,
  Menu,
  X,
  AlertCircle,
  Shield,
  User,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../layout/authcontent';

const sidebarSections = [
  {
    title: 'Textile Wall Covering Gallery',
    items: [
      { name: 'Gallery', path: '/wallpaper', icon: Palette },
    ],
  },
  {
    title: 'Textile Wall Covering Collections',
    items: [
      { name: 'Collections', path: '/wallcoveringcollections', icon: FileImage },
    ],
  },
  {
    title: 'Recent Installation',
    items: [
      { name: 'Recent Installations', path: '/recentinstallation', icon: Package },
    ],
  },
  {
    title: 'Services',
    items: [
      { name: 'Our Services', path: '/services', icon: Sparkles },
    ],
  },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { logout } = useAuth();
  const isMounted = useRef(true);

  // JSX-friendly (no TypeScript)
  const isActive = (path) => pathname === path;

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('aside') && !event.target.closest('button[class*="top-4 left-4"]')) {
        if (isMounted.current) {
          setIsOpen(false);
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  // Close sidebar when route changes on mobile - FIXED VERSION
  useEffect(() => {
    if (!isMounted.current) return;
    
    const closeSidebar = () => {
      if (isOpen) {
        // Use setTimeout to ensure this runs after render
        setTimeout(() => {
          if (isMounted.current) {
            setIsOpen(false);
          }
        }, 0);
      }
    };
    
    closeSidebar();
  }, [pathname]); // Remove isOpen from dependencies

  // Handle ESC key to close logout modal
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && showLogoutModal) {
        setShowLogoutModal(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [showLogoutModal]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showLogoutModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showLogoutModal]);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    logout();

    toast.success('Logged out successfully', {
      position: 'top-right',
      duration: 3000,
      style: {
        background: '#059669',
        color: '#fff',
        border: '1px solid #047857',
        borderRadius: '12px',
        padding: '16px',
      },
      icon: '👋',
    });

    setShowLogoutModal(false);
    router.push('/');
  };

  const openLogoutModal = () => {
    setShowLogoutModal(true);
  };

  const closeLogoutModal = () => {
    setShowLogoutModal(false);
  };

  const handleLinkClick = () => {
    if (window.innerWidth < 640) {
      setTimeout(() => {
        if (isMounted.current) {
          setIsOpen(false);
        }
      }, 0);
    }
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed z-50 top-4 left-4 inline-flex items-center p-2 rounded-lg sm:hidden bg-gray-800 text-white hover:bg-gray-700"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 sm:hidden"
          onClick={() => {
            if (isMounted.current) {
              setIsOpen(false);
            }
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } sm:translate-x-0 bg-gradient-to-b from-gray-900 to-gray-800 shadow-xl`}
      >
        <div className="h-full px-3 py-4 overflow-y-auto flex flex-col">
          {/* Header */}
          <div className="px-4 py-6 mb-4 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">
              Reimagine <span className="text-blue-400">Wall</span>
            </h2>
            <p className="text-sm text-gray-400">Scot & Bel Studio</p>
          </div>

          {/* Menu */}
          <ul className="space-y-4 flex-1">
            {sidebarSections.map((section) => (
              <li key={section.title}>
                <h3 className="text-xs uppercase text-gray-500 font-semibold px-2 mb-2">
                  {section.title}
                </h3>

                <ul className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);

                    return (
                      <li key={item.path}>
                        <Link
                          href={item.path}
                          className={`flex items-center p-3 rounded-lg transition-colors ${
                            active
                              ? 'bg-gray-700 text-white'
                              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          }`}
                          onClick={handleLinkClick}
                        >
                          <Icon className="w-5 h-5 text-blue-400" />
                          <span className="ml-3">{item.name}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>

          {/* Logout Button */}
          <div className="pt-3 mt-auto border-t border-gray-700">
            <button
              onClick={openLogoutModal}
              className="flex items-center w-full p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition group"
            >
              <div className="relative">
                <LogOut className="w-5 h-5 text-red-400 group-hover:scale-110 transition-transform" />
              </div>
              <span className="ml-3">Logout</span>
            </button>
          </div>

          {/* Footer */}
          <p className="text-xs text-gray-500 text-center mt-4">
            © 2026 Ellendorf. All rights reserved.
          </p>
        </div>
      </aside>

      {/* Luxury White Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50">
          {/* Darkened Background with Blur Effect */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-all duration-300"
            onClick={closeLogoutModal}
          />
          
          {/* Modal Container */}
          <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
            {/* Modal Content - Centered with Glass Effect */}
            <div 
              className="relative w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Glowing Border Effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-300 to-rose-300 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              
              {/* Main Modal Card - WHITE/LUXURY THEME */}
              <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 shadow-2xl border border-gray-200">
                
                {/* Elegant Header */}
                <div className="text-center mb-8">
                  {/* Icon Container with Glow */}
                  <div className="relative inline-flex mb-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-rose-200 to-amber-200 rounded-full blur-md opacity-60"></div>
                    <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-rose-50 to-amber-50 border border-rose-200 flex items-center justify-center shadow-lg">
                      <AlertCircle className="w-10 h-10 text-rose-600" />
                    </div>
                    
                    {/* Animated Rings */}
                    <div className="absolute inset-0 border-2 border-rose-200 rounded-full animate-ping"></div>
                    <div className="absolute inset-0 border border-rose-100 rounded-full"></div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Confirm Logout
                  </h3>
                  <p className="text-gray-600 text-sm font-medium">
                    Secure Session Termination
                  </p>
                </div>

                {/* Message Content */}
                <div className="mb-8 text-center">
                  <p className="text-gray-800 text-lg mb-3 font-medium">
                    Are you sure you want to logout?
                  </p>
                  <p className="text-gray-600 text-sm">
                    You will be securely signed out and redirected to the login page.
                    <br />
                    Any unsaved changes will be lost.
                  </p>
                  
                  {/* Security Info */}
                  <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-100 shadow-sm">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-rose-600" />
                      <span className="text-xs text-gray-700 font-medium">Secure Session</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      All your data will be securely cleared from this device
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={closeLogoutModal}
                    className="flex-1 px-6 py-3.5 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 hover:text-gray-900 font-medium transition-all duration-300 hover:shadow-lg border border-gray-300 hover:border-gray-400 flex items-center justify-center gap-2"
                  >
                    <span className="font-semibold">Cancel</span>
                    <span className="text-xs opacity-60 bg-gray-300 px-2 py-0.5 rounded">ESC</span>
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className="flex-1 px-6 py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-rose-900/30 group flex items-center justify-center gap-2 relative overflow-hidden"
                  >
                    {/* Button Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-rose-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Button Content */}
                    <div className="relative flex items-center gap-2">
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </div>
                  </button>
                </div>

                {/* Footer Note */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                    <User className="w-3 h-3" />
                    <span className="font-medium">Session will be terminated immediately</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}