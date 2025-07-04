import React, { useState, useEffect } from "react";
import { 
  Bell, 
  ChevronDown,
  LogOut,
  User,
  Sun,
  Moon,
  Calendar
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { getInitials } from "@/lib/utils";
import EventSelector from "../event/event-selector";

interface HeaderProps {
  toggleSidebar?: () => void;
  currentEvent?: {
    title: string;
    date: string;
  };
}

export default function Header({ toggleSidebar, currentEvent }: HeaderProps) {
  const { user, logout } = useAuth();
  const [notifications] = useState(2);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const initialTheme = mediaQuery.matches ? 'dark' : 'light';
    setTheme(initialTheme);

    if (initialTheme === 'dark') {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      document.documentElement.style.colorScheme = 'light';
    }

    const handleChange = (e: MediaQueryListEvent) => {
      const newTheme = e.matches ? 'dark' : 'light';
      setTheme(newTheme);
      if (newTheme === 'dark') {
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
        document.documentElement.style.colorScheme = 'dark';
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        document.documentElement.style.colorScheme = 'light';
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      document.documentElement.style.colorScheme = 'light';
    }
  };

  if (!user) return null;

  return (
    <header className="bg-background border-b border-border">
      {/* Professional Single Header Bar */}
      <div className="bg-background px-6 py-4 flex items-center justify-between">
        {/* Left Section - Event Selection */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-accent" />
            <span className="text-sm font-semibold text-foreground">Current Event:</span>
            <div className="min-w-0">
              <EventSelector />
            </div>
          </div>
        </div>

        {/* Right Section - Controls & Profile (Standard Right Alignment) */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle - Professional Switch Design */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Theme</span>
            <button
              onClick={toggleTheme}
              className="relative w-12 h-6 bg-muted border border-border flex items-center flat transition-colors hover:bg-muted/80"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            >
              <div 
                className={`absolute w-4 h-4 bg-accent transition-transform duration-200 flat ${
                  theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                }`}
              >
                {theme === 'light' ? (
                  <Sun className="h-3 w-3 text-accent-foreground m-0.5" />
                ) : (
                  <Moon className="h-3 w-3 text-accent-foreground m-0.5" />
                )}
              </div>
            </button>
          </div>

          {/* Notifications - Professional Design */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Alerts</span>
            <div className="relative">
              <button 
                className="p-2 bg-background border border-border hover:bg-muted flat transition-colors"
                aria-label={`${notifications} notifications`}
              >
                <Bell className="h-4 w-4 text-foreground" />
                {notifications > 0 && (
                  <div className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center flat px-1">
                    {notifications}
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Profile - Standard Right Alignment */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 px-4 py-2 bg-card border border-border hover:bg-muted flat transition-colors">
                <div className="w-8 h-8 bg-accent text-accent-foreground font-bold text-sm flex items-center justify-center flat">
                  {getInitials(user.name)}
                </div>
                <div className="text-left min-w-0">
                  <div className="text-sm font-semibold text-foreground truncate">{user.name}</div>
                  <div className="text-xs text-muted-foreground capitalize">{user.role}</div>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 bg-background border border-border flat">
              <DropdownMenuLabel className="text-foreground px-4 py-3">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-accent font-medium capitalize">{user.role}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem className="text-foreground hover:bg-muted px-4 py-2">
                <User className="mr-3 h-4 w-4" />
                <span>Profile Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem 
                onClick={logout}
                className="text-destructive hover:bg-destructive/10 px-4 py-2"
              >
                <LogOut className="mr-3 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}