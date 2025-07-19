import React from "react";
import { Outlet, Link, useLocation } from "wouter";
import { 
  Users, 
  Building2, 
  BarChart3, 
  Settings, 
  Shield, 
  Database,
  UserCog,
  Crown,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";

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
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <Shield className="h-12 w-12 text-red-500" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
                <p className="text-sm text-gray-600 mt-1">
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
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Crown className="h-8 w-8 text-amber-500" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Portal</h1>
                <p className="text-xs text-gray-500">System Administration</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                <UserCog className="h-3 w-3 mr-1" />
                Administrator
              </Badge>
              
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={logout}
                  className="text-gray-600 hover:text-gray-900"
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
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Navigation</h3>
                <nav className="space-y-2">
                  {adminNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location === item.href || 
                      (item.href !== '/admin' && location.startsWith(item.href));
                    
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`group flex items-start space-x-3 p-3 rounded-lg transition-colors ${
                          isActive 
                            ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <Icon className={`h-5 w-5 mt-0.5 ${
                          isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                        }`} />
                        <div>
                          <p className={`text-sm font-medium ${
                            isActive ? 'text-blue-700' : 'text-gray-900'
                          }`}>
                            {item.label}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {item.description}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </nav>
                
                {/* Quick Return to Main App */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/dashboard">
                      ← Return to Main App
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Admin Content Area */}
          <div className="lg:col-span-3">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}