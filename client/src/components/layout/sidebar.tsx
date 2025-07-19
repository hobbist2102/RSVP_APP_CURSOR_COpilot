import React from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Users,
  Reply,
  Calendar,
  Plane,
  Car,
  Utensils,
  FileSpreadsheet,
  Settings,
  LogOut,
  Mail,
  Wand2,
  ChevronLeft,
  ChevronRight,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

interface SidebarProps {
  isOpen: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function Sidebar({ isOpen, isCollapsed = false, onToggleCollapse }: SidebarProps) {
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
      name: "Flight Coordination",
      icon: <Plane className="mr-3 h-5 w-5" />,
      path: "/travel-management"
    },
    {
      name: "Transport Groups",
      icon: <Car className="mr-3 h-5 w-5" />,
      path: "/transport"
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

  ];

  const sidebarClasses = cn(
    "glass flex-shrink-0 fixed h-full z-10 transition-all duration-300 lg:static border-r border-border",
    isCollapsed ? "w-16" : "w-56",
    isOpen ? "left-0" : (isCollapsed ? "-left-16 lg:left-0" : "-left-56 lg:left-0")
  );

  return (
    <aside className={sidebarClasses}>
      {/* Collapse Toggle - Desktop Only */}
      <div className="hidden lg:flex justify-end p-2">
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      <nav className="mt-2 px-2 space-y-1">
        {menuItems.map((item) => (
          <Link key={item.path} href={item.path}>
            <div
              className={cn(
                "group flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer transition-all duration-200 hover:scale-105",
                location === item.path
                  ? "bg-primary/10 text-primary border-l-4 border-primary font-semibold"
                  : "text-foreground hover:bg-muted hover:text-primary",
                isCollapsed && "justify-center"
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <span className={cn("flex-shrink-0", !isCollapsed && "mr-3")}>
                {React.cloneElement(item.icon, { className: "h-5 w-5" })}
              </span>
              {!isCollapsed && (
                <span className="truncate">{item.name}</span>
              )}
            </div>
          </Link>
        ))}
      </nav>
      
      <div className={cn("mt-6", isCollapsed ? "px-2" : "px-4")}>
        <div className="pt-4 border-t border-border">
          <button
            className={cn(
              "w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-foreground hover:bg-muted hover:scale-105 transition-all duration-200",
              isCollapsed && "justify-center"
            )}
            onClick={logout}
            title={isCollapsed ? "Sign Out" : undefined}
          >
            <LogOut className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
            {!isCollapsed && "Sign Out"}
          </button>
        </div>
      </div>
    </aside>
  );
}
