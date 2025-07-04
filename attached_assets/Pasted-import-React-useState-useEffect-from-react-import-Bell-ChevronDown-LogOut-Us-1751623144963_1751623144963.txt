import React, { useState, useEffect } from "react";
import { 
  Bell, 
  ChevronDown,
  LogOut,
  User,
  Sun,
  Moon
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
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";
import EventSelector from "../event/event-selector";

interface HeaderProps {
  toggleSidebar: () => void;
  currentEvent?: {
    title: string;
    date: string;
  };
}

export default function Header({ toggleSidebar, currentEvent }: HeaderProps) {
  const { user, logout } = useAuth();
  const [notifications] = useState(2); // Example notification count
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Check system preference on mount
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const initialTheme = mediaQuery.matches ? 'dark' : 'light';
    setTheme(initialTheme);

    // Apply initial theme
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

    // Apply theme classes to the entire document
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

  return (
    <header className="bg-background border-b border-border text-foreground sticky top-0 z-50 flat">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center space-x-2">
          <Calendar className="h-6 w-6 text-primary" />
          <span className="font-semibold text-lg text-foreground">Eternally Yours</span>
        </div>

        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="relative transition-all duration-200 hover:bg-primary/10 hover:text-primary"
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5 transition-transform duration-200" />
            ) : (
              <Sun className="h-5 w-5 transition-transform duration-200" />
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notifications > 0 && (
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-destructive"></span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <span className="text-sm text-foreground">New RSVP from John Davis</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span className="text-sm text-foreground">Accommodation request from Rachel Lee</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center space-x-2 cursor-pointer">
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <span className="text-sm font-medium">{user ? getInitials(user.name) : "?"}</span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-foreground">{user?.name || "Guest"}</p>
                  <p className="text-xs text-muted-foreground">{user?.role === "admin" ? "Administrator" : user?.role === "couple" ? "Couple" : "Staff"}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="glass border-y border-border px-4 py-2 flex items-center justify-end">
        {/* EventSelector loads here */}
        <div className="flex-1 max-w-sm ml-auto">
          <EventSelector />
        </div>
      </div>
    </header>
  );
}