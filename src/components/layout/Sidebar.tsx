'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  Package,
  BarChart3,
  Settings,
  User,
  Moon,
  Sun,
  Home,
  TrendingUp,
  FileText,
  CreditCard
} from 'lucide-react';
import { useTheme } from '@/components/layout/ThemeProvider';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const Sidebar = ({ isCollapsed, toggleSidebar }: SidebarProps) => {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

  // Navigation items
  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'POS', href: '/pos', icon: CreditCard },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Reports', href: '/reports', icon: FileText },
    { name: 'Analytics', href: '/analytics', icon: TrendingUp },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const mobileSidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Only handle mobile sidebar click outside
      if (window.innerWidth < 768 && !isCollapsed && mobileSidebarRef.current) {
        const isClickInsideMobileSidebar = mobileSidebarRef.current.contains(event.target as Node);

        if (!isClickInsideMobileSidebar) {
          toggleSidebar();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCollapsed, toggleSidebar]);

  return (
    <>
      {/* Desktop Sidebar */}
      <AnimatePresence>
        {isCollapsed ? (
          <motion.div
            key="collapsed-sidebar"
            initial={{ width: 240, opacity: 1 }}
            animate={{ width: 80, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="hidden md:flex flex-col border-r border-gray-700 bg-gray-900/50 backdrop-blur-xl bg-opacity-70 min-h-screen"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <Link href="/" className="bg-gradient-to-r from-blue-500 to-teal-500 w-10 h-10 rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity">
                <Package className="h-6 w-6 text-white" />
              </Link>
            </div>

            <nav className="flex-1 py-4">
              <ul className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <li key={item.name} className="relative group">
                      <Link
                        href={item.href}
                        className={`flex flex-col items-center gap-1 rounded-lg py-3 transition-all duration-200 relative ${
                          isActive
                            ? 'bg-blue-600/30 text-blue-300'
                            : 'hover:bg-gray-800/50 text-gray-300 hover:scale-105'
                        }`}
                      >
                        <Icon className="h-6 w-6" />
                        {/* Tooltip for navigation name on hover */}
                        <div className="absolute left-full ml-2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[1000] whitespace-nowrap top-1/2 -translate-y-1/2">
                          {item.name}
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="flex flex-col items-center">
              <button
                className="flex flex-col items-center gap-1 rounded-lg py-3 text-gray-300 hover:bg-gray-800/50 transition-colors w-full justify-center mt-2"
                onClick={toggleSidebar}
              >
                <Menu className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="expanded-sidebar"
            initial={{ width: 80, opacity: 1 }}
            animate={{ width: 240, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="hidden md:flex flex-col border-r border-gray-700 bg-gray-900/50 backdrop-blur-xl bg-opacity-70 min-h-screen"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <Link href="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400 hover:opacity-80 transition-opacity">
                InventoryPro
              </Link>
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-md hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 px-2 py-4">
              <ul className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-blue-600/30 text-blue-300 border-l-4 border-blue-400'
                            : 'hover:bg-gray-800/50 text-gray-300 hover:translate-x-2'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="md:hidden fixed inset-y-0 left-0 z-50 w-64 bg-gray-900/90 backdrop-blur-xl bg-opacity-70 border-r border-gray-700"
            ref={mobileSidebarRef}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <Link href="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400 hover:opacity-80 transition-opacity">
                InventoryPro
              </Link>
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-md hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 px-2 py-4">
              <ul className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-blue-600/30 text-blue-300 border-l-4 border-blue-400'
                            : 'hover:bg-gray-800/50 text-gray-300 hover:translate-x-2'
                        }`}
                        onClick={toggleSidebar}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;