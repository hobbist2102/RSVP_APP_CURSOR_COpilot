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
  BarChart3,
  Wand2
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
    title: 'Event Setup Wizard',
    href: '/event-setup-wizard',
    icon: Wand2,
    description: 'Configure new events'
  },
  {
    title: 'RSVP Management',
    href: '/rsvp-management',
    icon: FileText,
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
    description: 'Travel management'
  }
];

interface SidebarProps {
  isCollapsed?: boolean;
}

export default function Sidebar({ isCollapsed = false }: SidebarProps) {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-background border-r border-border flex flex-col">
      {/* Sidebar Header - Aligned with main header */}
      <div className="px-6 py-4 border-b border-border">
        <Link href="/dashboard">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-accent text-accent-foreground font-bold text-lg flex items-center justify-center flat">
              W
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Wedding RSVP</h1>
              <p className="text-xs text-muted-foreground">Management Platform</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 py-6">
        <div className="space-y-2">
          {sidebarItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 transition-colors flat group",
                    "border-l-3 hover:bg-muted/50",
                    isActive 
                      ? "bg-muted border-l-accent text-foreground" 
                      : "border-l-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {item.title}
                    </div>
                    {item.description && (
                      <div className="text-xs text-muted-foreground truncate">
                        {item.description}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Sidebar Footer */}
      <div className="px-4 py-4 border-t border-border">
        <Link href="/settings">
          <div className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors flat">
            <Settings className="h-4 w-4" />
            <span className="text-sm font-medium">Settings</span>
          </div>
        </Link>
      </div>
    </aside>
  );
}