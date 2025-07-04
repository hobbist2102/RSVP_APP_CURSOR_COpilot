import React from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Users,
  Reply,
  Calendar,
  Plane,
  Utensils,
  FileSpreadsheet,
  Settings,
  LogOut,
  Mail,
  Wand2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

interface SidebarProps {
  isOpen: boolean;
}

export default function Sidebar({ isOpen }: SidebarProps) {
  const [location] = useLocation();
  const { logout } = useAuth();
  
  const menuItems = [
    {
      name: "Dashboard",
      icon: <LayoutDashboard className="mr-3 h-5 w-5" />,
      path: "/dashboard"
    },
    {
      name: "Event Setup Wizard",
      icon: <Wand2 className="mr-3 h-5 w-5" />,
      path: "/event-setup-wizard"
    },
    {
      name: "Events",
      icon: <Calendar className="mr-3 h-5 w-5" />,
      path: "/events"
    },
    {
      name: "Guest List",
      icon: <Users className="mr-3 h-5 w-5" />,
      path: "/guests"
    },
    {
      name: "RSVP Management",
      icon: <Reply className="mr-3 h-5 w-5" />,
      path: "/rsvp"
    },
    {
      name: "Travel Management",
      icon: <Plane className="mr-3 h-5 w-5" />,
      path: "/travel"
    },
    {
      name: "Meal Planning",
      icon: <Utensils className="mr-3 h-5 w-5" />,
      path: "/meals"
    },
    {
      name: "Reports",
      icon: <FileSpreadsheet className="mr-3 h-5 w-5" />,
      path: "/reports"
    },
    {
      name: "Settings",
      icon: <Settings className="mr-3 h-5 w-5" />,
      path: "/settings"
    },
    {
      name: "Email Templates",
      icon: <Mail className="mr-3 h-5 w-5" />,
      path: "/email-templates"
    }
  ];

  const sidebarClasses = cn(
    "bg-sidebar w-64 flex-shrink-0 fixed h-full z-10 transition-all duration-300 lg:static border-r border-border",
    isOpen ? "left-0" : "-left-64 lg:left-0"
  );

  return (
    <aside className={sidebarClasses}>
      <nav className="mt-5 px-2 space-y-1">
        {menuItems.map((item) => (
          <Link key={item.path} href={item.path}>
            <div
              className={cn(
                "group flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer transition-all duration-200 hover:scale-105",
                location === item.path
                  ? "bg-primary/10 text-primary border-l-4 border-primary font-semibold"
                  : "text-foreground hover:bg-muted hover:text-primary"
              )}
            >
              {item.icon}
              {item.name}
            </div>
          </Link>
        ))}
      </nav>
      
      <div className="px-4 mt-6">
        <div className="pt-4 border-t border-border">
          <button
            className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-foreground hover:bg-muted hover:scale-105 transition-all duration-200"
            onClick={logout}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}
