'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/layout/ThemeProvider';

import { Button } from '@/components/ui/Button';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="rounded-full"
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  );
}