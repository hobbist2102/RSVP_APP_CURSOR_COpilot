'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Shield, 
  Users, 
  Calendar, 
  Database, 
  Activity, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Server,
  Globe,
  Lock,
  Eye,
  Download,
  RefreshCw,
  Settings,
  Zap,
  UserCheck,
  FileText,
  BarChart3
} from 'lucide-react'

interface SystemMetrics {
  totalUsers: number
  activeEvents: number
  totalGuests: number
  systemUptime: string
  apiResponseTime: number
  databaseConnections: number
  memoryUsage: number
  cpuUsage: number
  storageUsed: number
}

interface SecurityAlert {
  id: string
  type: 'login_failed' | 'rate_limit_exceeded' | 'suspicious_activity' | 'security_violation'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  ipAddress: string
  timestamp: Date
  resolved: boolean
}

interface UserActivity {
  id: string
  userId: string
  userName: string
  action: string
  resource: string
  timestamp: Date
  ipAddress: string
}

const sampleMetrics: SystemMetrics = {
  totalUsers: 1247,
  activeEvents: 34,
  totalGuests: 12863,
  systemUptime: '15 days, 7 hours',
  apiResponseTime: 145,
  databaseConnections: 12,
  memoryUsage: 68.5,
  cpuUsage: 23.2,
  storageUsed: 45.8
}

const sampleSecurityAlerts: SecurityAlert[] = [
  {
    id: '1',
    type: 'login_failed',
    severity: 'medium',
    message: 'Multiple failed login attempts from single IP',
    ipAddress: '192.168.1.100',
    timestamp: new Date('2024-01-15T14:30:00'),
    resolved: false
  },
  {
    id: '2',
    type: 'rate_limit_exceeded',
    severity: 'high',
    message: 'Rate limit exceeded for API endpoint /api/guests',
    ipAddress: '10.0.0.50',
    timestamp: new Date('2024-01-15T13:15:00'),
    resolved: true
  },
  {
    id: '3',
    type: 'suspicious_activity',
    severity: 'critical',
    message: 'Unusual data export patterns detected',
    ipAddress: '203.45.67.89',
    timestamp: new Date('2024-01-15T12:00:00'),
    resolved: false
  }
]

const sampleUserActivity: UserActivity[] = [
  {
    id: '1',
    userId: 'user-123',
    userName: 'Sarah Johnson',
    action: 'bulk_guest_import',
    resource: 'guests',
    timestamp: new Date('2024-01-15T15:45:00'),
    ipAddress: '192.168.1.25'
  },
  {
    id: '2',
    userId: 'user-456',
    userName: 'Michael Chen',
    action: 'event_created',
    resource: 'events',
    timestamp: new Date('2024-01-15T15:30:00'),
    ipAddress: '10.0.0.75'
  },
  {
    id: '3',
    userId: 'user-789',
    userName: 'Emma Wilson',
    action: 'communication_sent',
    resource: 'communications',
    timestamp: new Date('2024-01-15T15:15:00'),
    ipAddress: '172.16.0.100'
  }
]

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [metrics, setMetrics] = useState<SystemMetrics>(sampleMetrics)
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>(sampleSecurityAlerts)
  const [userActivity, setUserActivity] = useState<UserActivity[]>(sampleUserActivity)
  const [isLoading, setIsLoading] = useState(false)

  const refreshMetrics = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
  }

  const resolveAlert = (alertId: string) => {
    setSecurityAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, resolved: true } : alert
      )
    )
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive'
      case 'high': return 'destructive'
      case 'medium': return 'warning'
      case 'low': return 'secondary'
      default: return 'secondary'
    }
  }

  const getHealthStatus = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'critical'
    if (value >= thresholds.warning) return 'warning'
    return 'good'
  }

  const renderSystemHealth = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Server className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">CPU Usage</p>
              <p className="text-2xl font-bold">{metrics.cpuUsage}%</p>
              <Badge variant={getHealthStatus(metrics.cpuUsage, { warning: 70, critical: 90 }) === 'good' ? 'success' : 'warning'}>
                {getHealthStatus(metrics.cpuUsage, { warning: 70, critical: 90 })}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Database className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Memory Usage</p>
              <p className="text-2xl font-bold">{metrics.memoryUsage}%</p>
              <Badge variant={getHealthStatus(metrics.memoryUsage, { warning: 80, critical: 95 }) === 'good' ? 'success' : 'warning'}>
                {getHealthStatus(metrics.memoryUsage, { warning: 80, critical: 95 })}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Zap className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">API Response</p>
              <p className="text-2xl font-bold">{metrics.apiResponseTime}ms</p>
              <Badge variant={getHealthStatus(metrics.apiResponseTime, { warning: 500, critical: 1000 }) === 'good' ? 'success' : 'warning'}>
                {getHealthStatus(metrics.apiResponseTime, { warning: 500, critical: 1000 })}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Globe className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Storage Used</p>
              <p className="text-2xl font-bold">{metrics.storageUsed}%</p>
              <Badge variant={getHealthStatus(metrics.storageUsed, { warning: 80, critical: 95 }) === 'good' ? 'success' : 'warning'}>
                {getHealthStatus(metrics.storageUsed, { warning: 80, critical: 95 })}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
              <p className="text-gray-600 mt-2">
                System overview, security monitoring, and administrative controls
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={refreshMetrics} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button>
                <Settings className="w-4 h-4 mr-2" />
                System Settings
              </Button>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold">{metrics.totalUsers.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Calendar className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Events</p>
                      <p className="text-2xl font-bold">{metrics.activeEvents}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <UserCheck className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Guests</p>
                      <p className="text-2xl font-bold">{metrics.totalGuests.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Clock className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">System Uptime</p>
                      <p className="text-lg font-bold">{metrics.systemUptime}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Real-time system performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                {renderSystemHealth()}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent System Activity</CardTitle>
                <CardDescription>Latest user actions and system events</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Resource</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>IP Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userActivity.slice(0, 5).map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell className="font-medium">{activity.userName}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {activity.action.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>{activity.resource}</TableCell>
                        <TableCell>{activity.timestamp.toLocaleTimeString()}</TableCell>
                        <TableCell className="font-mono text-sm">{activity.ipAddress}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            {/* Security Alerts */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="w-5 h-5" />
                      <span>Security Alerts</span>
                    </CardTitle>
                    <CardDescription>Active security incidents and threats</CardDescription>
                  </div>
                  <Badge variant="destructive">
                    {securityAlerts.filter(alert => !alert.resolved).length} Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {securityAlerts.map((alert) => (
                    <Alert key={alert.id} className={alert.resolved ? 'opacity-60' : ''}>
                      <AlertTriangle className="h-4 w-4" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge variant={getSeverityColor(alert.severity)}>
                              {alert.severity.toUpperCase()}
                            </Badge>
                            <span className="font-medium">{alert.message}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {alert.resolved ? (
                              <Badge variant="success">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Resolved
                              </Badge>
                            ) : (
                              <Button size="sm" onClick={() => resolveAlert(alert.id)}>
                                Resolve
                              </Button>
                            )}
                          </div>
                        </div>
                        <AlertDescription className="mt-2">
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>IP: {alert.ipAddress}</span>
                            <span>Time: {alert.timestamp.toLocaleString()}</span>
                            <span>Type: {alert.type.replace('_', ' ')}</span>
                          </div>
                        </AlertDescription>
                      </div>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Security Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-600">99.8%</div>
                  <div className="text-sm text-gray-600">Security Score</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600">0</div>
                  <div className="text-sm text-gray-600">Active Threats</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-yellow-600">24</div>
                  <div className="text-sm text-gray-600">Blocked IPs</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user accounts and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>User management interface</p>
                  <p className="text-sm">Create, edit, and manage user accounts and roles</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Management</CardTitle>
                <CardDescription>Monitor and manage all wedding events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Event management interface</p>
                  <p className="text-sm">View, monitor, and manage all wedding events in the system</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Configuration</CardTitle>
                <CardDescription>System settings and maintenance tools</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Button variant="outline" className="h-20 flex-col">
                    <Database className="w-6 h-6 mb-2" />
                    Database Backup
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Download className="w-6 h-6 mb-2" />
                    Export Logs
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Lock className="w-6 h-6 mb-2" />
                    Security Settings
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <RefreshCw className="w-6 h-6 mb-2" />
                    System Restart
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Activity className="w-6 h-6 mb-2" />
                    Performance Monitor
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <FileText className="w-6 h-6 mb-2" />
                    Audit Logs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Analytics</CardTitle>
                <CardDescription>Platform usage statistics and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>System analytics dashboard</p>
                  <p className="text-sm">Usage trends, performance metrics, and platform insights</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}