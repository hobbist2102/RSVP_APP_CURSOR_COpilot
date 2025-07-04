import React from 'react';
import { Button } from '@/components/ui/button';
import { MoonIcon, SunIcon, UserIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/use-auth';

export function Header() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <a className="mr-6 flex items-center space-x-2" href="/">
            <span className="hidden font-bold sm:inline-block text-foreground">
              Wedding RSVP
            </span>
          </a>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Navigation items */}
          </div>
          <nav className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="flat bg-transparent hover:bg-muted text-foreground"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              <SunIcon className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <MoonIcon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {user && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {user.name}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="flat bg-transparent hover:bg-muted text-foreground"
                  onClick={logout}
                >
                  <UserIcon className="h-4 w-4" />
                </Button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}