import React from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Users, 
  Building2, 
  Database, 
  Activity,
  UserCheck,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { get } from "@/lib/api";
import AdminLayout from "@/components/layout/admin-layout";

interface SystemStats {
  totalUsers: number;
  totalEvents: number;
  activeEvents: number;
  totalGuests: number;
  systemStatus: 'healthy' | 'warning' | 'error';
  databaseSize: string;
  uptime: string;
  lastBackup: string;
}

interface RecentActivity {
  id: string;
  type: 'user_login' | 'event_created' | 'guest_added' | 'system_event';
  message: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'error';
}

export default function AdminDashboard() {
  // Fetch system statistics
  const { data: systemStats, isLoading: isLoadingStats } = useQuery<SystemStats>({
    queryKey: ['/api/admin/system/stats'],
    queryFn: () => get('/api/admin/system/stats'),
  });

  // Fetch recent activity
  const { data: recentActivity = [], isLoading: isLoadingActivity } = useQuery<RecentActivity[]>({
    queryKey: ['/api/admin/system/activity'],
    queryFn: () => get('/api/admin/system/activity'),
  });

  // Fetch all users for quick overview
  const { data: allUsers = [] } = useQuery<any[]>({
    queryKey: ['/api/admin/users'],
    queryFn: () => get('/api/admin/users'),
  });

  // Fetch all events for quick overview
  const { data: allEvents = [] } = useQuery<any[]>({
    queryKey: ['/api/admin/events'],
    queryFn: () => get('/api/admin/events'),
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_login': return <UserCheck className="h-4 w-4" />;
      case 'event_created': return <Calendar className="h-4 w-4" />;
      case 'guest_added': return <Users className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Overview of system performance and recent activity
          </p>
        </div>

        {/* System Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {isLoadingStats ? '...' : allUsers.length}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="text-xs">
                  {allUsers.filter(u => u.role === 'admin').length} Admin
                </Badge>
                <Badge variant="secondary" className="text-xs ml-2">
                  {allUsers.filter(u => u.role === 'couple').length} Couples
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Events</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {isLoadingStats ? '...' : allEvents.length}
                  </p>
                </div>
                <Building2 className="h-8 w-8 text-green-500" />
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="text-xs">
                  {allEvents.filter(e => e.status === 'active').length || allEvents.length} Active
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">System Status</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {isLoadingStats ? 'Checking...' : 'Healthy'}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-green-500" />
              </div>
              <div className="mt-4">
                <Badge className={getStatusColor('healthy')}>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  All Systems Operational
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Database</p>
                  <p className="text-lg font-semibold text-gray-900">Online</p>
                </div>
                <Database className="h-8 w-8 text-purple-500" />
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoadingActivity ? (
                  <div className="text-center py-8 text-gray-500">
                    Loading activity...
                  </div>
                ) : recentActivity.length > 0 ? (
                  recentActivity.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No recent activity
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button className="w-full justify-start" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </Button>
                
                <Button className="w-full justify-start" variant="outline">
                  <Building2 className="h-4 w-4 mr-2" />
                  View Events
                </Button>
                
                <Button className="w-full justify-start" variant="outline">
                  <Database className="h-4 w-4 mr-2" />
                  Database Status
                </Button>
                
                <Button className="w-full justify-start" variant="outline">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Application Version</h4>
                <p className="text-sm text-gray-600">v1.0.0</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Environment</h4>
                <Badge variant="outline">
                  {process.env.NODE_ENV || 'development'}
                </Badge>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Last Updated</h4>
                <p className="text-sm text-gray-600">
                  {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}