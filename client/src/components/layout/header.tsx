import React, { useState } from "react";
import { 
  Bell, 
  ChevronDown,
  LogOut,
  User
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

  return (
    <header className="bg-white shadow-sm">
      <div className="flex justify-between items-center px-4 py-2 mx-auto">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="p-2 rounded-md text-neutral hover:bg-gray-100 lg:hidden"
          >
            <span className="sr-only">Open sidebar</span>
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Button>
          <div>
            <h1 className="font-['Great_Vibes'] text-2xl text-primary">Eternally Yours</h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notifications > 0 && (
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <span className="text-sm">New RSVP from John Davis</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span className="text-sm">Accommodation request from Rachel Lee</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center space-x-2 cursor-pointer">
                <div className="h-8 w-8 rounded-full bg-secondary text-white flex items-center justify-center">
                  <span className="text-sm font-medium">{user ? getInitials(user.name) : "?"}</span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-neutral">{user?.name || "Guest"}</p>
                  <p className="text-xs text-gray-500">{user?.role === "admin" ? "Administrator" : user?.role === "couple" ? "Couple" : "Staff"}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500" />
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
      
      {currentEvent && (
        <div className="bg-gray-50 px-4 py-1 text-sm">
          <p className="text-gray-600">
            Event: <span className="font-medium">{currentEvent.title}</span> | 
            Date: <span className="font-medium">{currentEvent.date}</span>
          </p>
        </div>
      )}
    </header>
  );
}
