// src/components/UserDropdown.tsx
'use client';

import { signOut, useSession } from 'next-auth/react';
import * as React from 'react';
import * as Avatar from '@radix-ui/react-avatar';
import * as Popover from '@radix-ui/react-popover';
import { LogOut, User } from 'lucide-react';
import toast from 'react-hot-toast';

interface UserDropdownProps {
  className?: string;
}

const UserDropdown = ({ className }: UserDropdownProps) => {
  const { data: session } = useSession();
  const user = session?.user;

  if (!user) {
    return null;
  }

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          className={`flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full cursor-pointer hover:opacity-80 transition-opacity ${className || ''}`}
          aria-label="User menu"
        >
          <Avatar.Root className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center cursor-pointer">
            <Avatar.Fallback className="flex items-center justify-center h-full w-full text-white text-xs cursor-pointer">
              {user.name ? user.name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
            </Avatar.Fallback>
          </Avatar.Root>
          <span className="hidden md:inline text-sm text-gray-200">{user.name || user.email}</span>
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          sideOffset={8}
          className="z-50 w-56 p-0 bg-gray-800 rounded-lg shadow-lg border border-gray-700 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
        >
          <div className="p-3 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <Avatar.Root className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center">
                <Avatar.Fallback className="flex items-center justify-center h-full w-full text-white">
                  {user.name ? user.name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                </Avatar.Fallback>
              </Avatar.Root>
              <div>
                <p className="text-sm font-medium text-white">{user.name || 'User'}</p>
                <p className="text-xs text-gray-400 truncate max-w-[120px]">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="p-1">
            <button
              onClick={() => {}}
              className="w-full flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-md transition-colors cursor-pointer"
            >
              <User className="h-4 w-4 mr-2" />
              Profile
            </button>

            <button
              onClick={async () => {
                toast.success('Logging out...');
                await signOut({ callbackUrl: '/login' });
              }}
              className="w-full flex items-center px-3 py-2 text-sm text-red-400 hover:bg-red-900/30 rounded-md mt-1 transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Log out
            </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default UserDropdown;