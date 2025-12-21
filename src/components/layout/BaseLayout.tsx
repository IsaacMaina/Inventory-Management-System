'use client';

import { useState } from 'react';
import { Menu, X, Package, BarChart3, Settings, User, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/layout/ThemeProvider';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import UserDropdown from '@/components/UserDropdown';
import MovingBanner from '@/components/MovingBanner';

interface BaseLayoutProps {
  children: React.ReactNode;
}

const BaseLayout = ({ children }: BaseLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100">
      <Sidebar isCollapsed={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gray-900/50 backdrop-blur-xl bg-opacity-70 border-b border-gray-700">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              {sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 rounded-md hover:bg-gray-800 md:hidden mr-2"
                >
                  <Menu className="h-5 w-5" />
                </button>
              )}
              {sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 rounded-md hidden md:block hover:bg-gray-800 mr-2"
                >
                  <Menu className="h-5 w-5" />
                </button>
              )}
              <h2 className="text-lg font-semibold capitalize mr-4">
                {pathname.split('/')[1] || 'dashboard'}
              </h2>
            </div>

            {/* Centered App Logo/Name that redirects to dashboard */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <Link href="/dashboard" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400 hover:opacity-80 transition-opacity cursor-pointer">
                InventoryPro
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-gray-800"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <div className="relative group">
                <UserDropdown className="ml-4" />
                {/* Tooltip that shows on hover */}
                <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[1000] whitespace-nowrap">
                  <div>Admin User</div>
                  <div className="text-gray-300">admin@example.com</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gradient-to-br from-gray-900 to-gray-800">
          {children}
        </main>

        {/* Moving contact banner */}
        <MovingBanner />
      </div>
    </div>
  );
};

export default BaseLayout;