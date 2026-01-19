'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Bot,
  Users,
  User,
  Palette,
  Eye,
  LogOut,
  Home,
  Menu,
  Wrench,
  Camera,
  Sparkles,
  Package,
  FileImage,
} from 'lucide-react';
import { useAuth } from '../layout/authcontent';

const sidebarSections = [
  {
    title: 'Design Gallery',
    items: [
      { name: 'Wallpaper Gallery', path: '/wallpaper', icon: Palette },
    ],
  },
  {
    title: 'Installation',
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
  const { logout } = useAuth();

  const isActive = (path) => pathname === path;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed z-50 top-4 left-4 inline-flex items-center p-2 rounded-lg sm:hidden bg-gray-800 text-white hover:bg-gray-700"
      >
        <Menu className="w-6 h-6" />
      </button>

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
              Reimagine <span className="text-blue-400">AI</span>
            </h2>
            <p className="text-sm text-gray-400">Scot & Bels Studio</p>
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
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center p-3 rounded-lg transition-colors ${
                            active
                              ? 'bg-gray-700 text-white'
                              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          }`}
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

          {/* Logout */}
          <div className="pt-3 mt-auto border-t border-gray-700">
            <button
              onClick={handleLogout}
              className="flex items-center w-full p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition"
            >
              <LogOut className="w-5 h-5 text-red-400" />
              <span className="ml-3">Logout</span>
            </button>
          </div>

          {/* Footer */}
          <p className="text-xs text-gray-500 text-center mt-4">
            © Internal Team Ellendorf
          </p>
        </div>
      </aside>
    </>
  );
}
