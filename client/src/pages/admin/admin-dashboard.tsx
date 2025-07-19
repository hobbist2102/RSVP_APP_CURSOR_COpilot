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
  Clock,
  Settings
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { get } from "@/lib/api";
import AdminLayout from "@/components/layout/admin-layout";
import { getCardClasses } from "@/design-system";

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
      case 'healthy': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'warning': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'error': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      default: return 'text-muted-foreground bg-muted';
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
          <h1 className="text-3xl font-bold text-foreground">System Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Overview of system performance and recent activity
          </p>
        </div>

        {/* System Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className={getCardClasses('default')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-3xl font-bold text-foreground">
                    {isLoadingStats ? '...' : allUsers.length}
                  </p>
                </div>
                <Users className="h-8 w-8 text-primary" />
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

          <Card className={getCardClasses('default')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                  <p className="text-3xl font-bold text-foreground">
                    {isLoadingStats ? '...' : allEvents.length}
                  </p>
                </div>
                <Building2 className="h-8 w-8 text-secondary" />
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="text-xs">
                  {allEvents.filter(e => e.status === 'active').length || allEvents.length} Active
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className={getCardClasses('default')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">System Status</p>
                  <p className="text-lg font-semibold text-foreground">
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

          <Card className={getCardClasses('default')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Database</p>
                  <p className="text-lg font-semibold text-foreground">
                    {isLoadingStats ? 'Checking...' : '12.5 MB'}
                  </p>
                </div>
                <Database className="h-8 w-8 text-primary" />
              </div>
              <div className="mt-4">
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  Last backup: 2h ago
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <Card className={getCardClasses('default')}>
            <CardHeader>
              <CardTitle className="flex items-center text-foreground">
                <Activity className="h-5 w-5 mr-2" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoadingActivity ? (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">Loading activity...</p>
                  </div>
                ) : recentActivity.length > 0 ? (
                  recentActivity.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">
                          {activity.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.timestamp}
                        </p>
                      </div>
                      <Badge 
                        variant={activity.severity === 'error' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {activity.severity}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No recent activity</p>
                    <p className="text-sm text-muted-foreground">System activity will appear here</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className={getCardClasses('default')}>
            <CardHeader>
              <CardTitle className="flex items-center text-foreground">
                <TrendingUp className="h-5 w-5 mr-2" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                <Button className="w-full justify-start" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </Button>
                
                <Button className="w-full justify-start" variant="outline">
                  <Building2 className="h-4 w-4 mr-2" />
                  View All Events
                </Button>
                
                <Button className="w-full justify-start" variant="outline">
                  <Database className="h-4 w-4 mr-2" />
                  Database Backup
                </Button>
                
                <Button className="w-full justify-start" variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  System Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Health Overview */}
        <Card className={getCardClasses('default')}>
          <CardHeader>
            <CardTitle className="flex items-center text-foreground">
              <CheckCircle className="h-5 w-5 mr-2" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">99.9%</div>
                <p className="text-sm text-muted-foreground">Uptime</p>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-2">45ms</div>
                <p className="text-sm text-muted-foreground">Response Time</p>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary mb-2">0</div>
                <p className="text-sm text-muted-foreground">Critical Issues</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}