
import React from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Mail, 
  Settings,
  Hotel,
  Plane,
  UtensilsCrossed,
  FileText,
  BarChart3
} from 'lucide-react';

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ComponentType<any>;
  description?: string;
}

const sidebarItems: SidebarItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Overview and analytics'
  },
  {
    title: 'Guest List',
    href: '/guests',
    icon: Users,
    description: 'Manage guest information'
  },
  {
    title: 'Events',
    href: '/events',
    icon: Calendar,
    description: 'Event management'
  },
  {
    title: 'RSVP Management',
    href: '/rsvp',
    icon: Mail,
    description: 'RSVP tracking and follow-up'
  },
  {
    title: 'Accommodations',
    href: '/accommodations',
    icon: Hotel,
    description: 'Hotel and room management'
  },
  {
    title: 'Travel',
    href: '/travel',
    icon: Plane,
    description: 'Flight and transport coordination'
  },
  {
    title: 'Meals',
    href: '/meals',
    icon: UtensilsCrossed,
    description: 'Dietary preferences and catering'
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: BarChart3,
    description: 'Analytics and reporting'
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'Configuration and preferences'
  }
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="flex h-full w-64 flex-col bg-background border-r border-border">
      <div className="flex h-14 items-center border-b border-border px-4">
        <h2 className="text-lg font-semibold text-foreground">Wedding RSVP</h2>
      </div>
      
      <nav className="flex-1 space-y-1 p-4">
        {sidebarItems.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors duration-150 flat',
                isActive
                  ? 'bg-muted text-primary border-l-3 border-primary font-semibold'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              <div className="flex flex-col">
                <span>{item.title}</span>
                {item.description && (
                  <span className="text-xs text-muted-foreground">
                    {item.description}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
