import React from "react";
import { Link, useLocation } from "wouter";
import { 
  Users, 
  Building2, 
  BarChart3, 
  Settings, 
  Shield, 
  Database,
  UserCog,
  Crown,
  LogOut,
  Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { getCardClasses, getNavItemClasses } from "@/design-system";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const adminNavItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: BarChart3,
    description: "System overview & analytics"
  },
  {
    label: "Tenant Management",
    href: "/admin/tenants",
    icon: Building2,
    description: "Manage events & organizations"
  },
  {
    label: "User Management",
    href: "/admin/users",
    icon: Users,
    description: "Manage all system users"
  },
  {
    label: "Email Settings",
    href: "/admin/email-settings",
    icon: Mail,
    description: "Configure system email settings"
  },
  {
    label: "System Settings",
    href: "/admin/settings",
    icon: Settings,
    description: "Global system configuration"
  },
  {
    label: "Security",
    href: "/admin/security",
    icon: Shield,
    description: "Security & audit logs"
  },
  {
    label: "Database",
    href: "/admin/database",
    icon: Database,
    description: "Database status & management"
  }
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  // Check if user is admin
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className={getCardClasses('elevated')}>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <Shield className="h-12 w-12 text-destructive" />
              <div>
                <h2 className="text-xl font-semibold text-foreground">Access Denied</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Administrator privileges required to access this area.
                </p>
              </div>
              <Button asChild>
                <Link href="/dashboard">Return to Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Crown className="h-8 w-8 text-secondary" />
              <div>
                <h1 className="text-xl font-bold text-foreground">Admin Portal</h1>
                <p className="text-xs text-muted-foreground">System Administration</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-secondary/10 text-secondary">
                <UserCog className="h-3 w-3 mr-1" />
                Administrator
              </Badge>
              
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={logout}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Admin Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className={getCardClasses('default')}>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Admin Navigation</h3>
                <nav className="space-y-2">
                  {adminNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location === item.href || 
                      (item.href !== '/admin' && location.startsWith(item.href));
                    
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={getNavItemClasses(isActive)}
                      >
                        <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {item.label}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {item.description}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}