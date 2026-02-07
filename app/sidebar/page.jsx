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

  const handleLinkClick = () => {
    if (isMounted.current && window.innerWidth < 640) {
      setIsOpen(false);
    }
  };

  const handleLogout = () => {
    try {
      logout();
      router.push('/auth');
      toast.success('Logged out successfully');
      setShowLogoutModal(false);
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
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
              onClick={() => setShowLogoutModal(true)}
              className="w-full flex items-center p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            >
              <LogOut className="w-5 h-5 text-red-400" />
              <span className="ml-3">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700">
            <div className="flex items-center mb-4">
              <AlertCircle className="w-6 h-6 text-yellow-400 mr-3" />
              <h3 className="text-xl font-semibold text-white">Confirm Logout</h3>
            </div>
            <p className="text-gray-300 mb-6">Are you sure you want to logout?</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
