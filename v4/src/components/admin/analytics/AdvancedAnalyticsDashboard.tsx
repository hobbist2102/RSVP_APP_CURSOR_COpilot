'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'
import { 
  TrendingUp,
  Users,
  Mail,
  MessageCircle,
  Calendar,
  MapPin,
  Heart,
  UserCheck,
  UserX,
  Clock,
  DollarSign,
  Target,
  Activity,
  Download,
  RefreshCw,
  Filter,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Using shared schema field mappings
interface AnalyticsData {
  rsvpStats: {
    total: number
    confirmed: number
    pending: number
    declined: number
    confirmationRate: number
    dailyResponses: Array<{ date: string; count: number }>
  }
  guestStats: {
    totalGuests: number
    bridesSide: number
    groomsSide: number
    plusOnes: number
    children: number
    accommodationNeeds: number
    flightAssistance: number
  }
  communicationStats: {
    emailsSent: number
    emailsOpened: number
    emailsClicked: number
    whatsappSent: number
    whatsappDelivered: number
    openRate: number
    clickRate: number
    deliveryRate: number
  }
  ceremonyStats: {
    [ceremonyName: string]: {
      attending: number
      notAttending: number
      pending: number
      mealSelections: Record<string, number>
    }
  }
  accommodationStats: {
    totalRooms: number
    allocatedRooms: number
    occupancyRate: number
    hotelBreakdown: Record<string, number>
  }
  realtimeMetrics: {
    activeUsers: number
    recentRsvps: number
    systemHealth: 'good' | 'warning' | 'critical'
    lastUpdated: string
  }
}

interface CustomReport {
  id: string
  name: string
  description: string
  metrics: string[]
  filters: Record<string, any>
  chartType: 'bar' | 'line' | 'pie' | 'area'
  createdAt: string
}

interface AdvancedAnalyticsDashboardProps {
  eventId: number
  className?: string
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff88', '#ff0088']

export default function AdvancedAnalyticsDashboard({
  eventId,
  className
}: AdvancedAnalyticsDashboardProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [customReports, setCustomReports] = useState<CustomReport[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d')
  const [selectedMetric, setSelectedMetric] = useState('rsvp')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(30000) // 30 seconds

  useEffect(() => {
    fetchAnalyticsData()
    
    if (autoRefresh) {
      const interval = setInterval(fetchAnalyticsData, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [eventId, selectedTimeRange, autoRefresh, refreshInterval])

  const fetchAnalyticsData = async () => {
    try {
      const response = await fetch(`/api/analytics/advanced?eventId=${eventId}&timeRange=${selectedTimeRange}`)
      const result = await response.json()
      
      if (result.success) {
        setAnalyticsData(result.data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCustomReports = async () => {
    try {
      const response = await fetch(`/api/analytics/reports?eventId=${eventId}`)
      const result = await response.json()
      
      if (result.success) {
        setCustomReports(result.data)
      }
    } catch (error) {
      console.error('Error fetching custom reports:', error)
    }
  }

  const exportAnalytics = async (format: 'csv' | 'pdf' | 'excel') => {
    try {
      const response = await fetch(`/api/analytics/export?eventId=${eventId}&format=${format}&timeRange=${selectedTimeRange}`)
      const blob = await response.blob()
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `analytics-${eventId}-${selectedTimeRange}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting analytics:', error)
    }
  }

  const rsvpChartData = useMemo(() => {
    if (!analyticsData) return []
    
    return [
      { name: 'Confirmed', value: analyticsData.rsvpStats.confirmed, color: '#10b981' },
      { name: 'Pending', value: analyticsData.rsvpStats.pending, color: '#f59e0b' },
      { name: 'Declined', value: analyticsData.rsvpStats.declined, color: '#ef4444' }
    ]
  }, [analyticsData])

  const sideBreakdownData = useMemo(() => {
    if (!analyticsData) return []
    
    return [
      { name: "Bride's Side", value: analyticsData.guestStats.bridesSide, color: '#ec4899' },
      { name: "Groom's Side", value: analyticsData.guestStats.groomsSide, color: '#3b82f6' }
    ]
  }, [analyticsData])

  const communicationMetrics = useMemo(() => {
    if (!analyticsData) return []
    
    return [
      { 
        name: 'Email Performance',
        sent: analyticsData.communicationStats.emailsSent,
        opened: analyticsData.communicationStats.emailsOpened,
        clicked: analyticsData.communicationStats.emailsClicked
      },
      {
        name: 'WhatsApp Performance', 
        sent: analyticsData.communicationStats.whatsappSent,
        delivered: analyticsData.communicationStats.whatsappDelivered,
        opened: analyticsData.communicationStats.whatsappDelivered // Assume delivered = opened for WhatsApp
      }
    ]
  }, [analyticsData])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100'
      case 'warning': return 'text-yellow-600 bg-yellow-100'
      case 'critical': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <div className={cn("space-y-6", className)}>
        <Card>
          <CardContent className="py-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mr-3"></div>
              Loading advanced analytics...
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className={cn("space-y-6", className)}>
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No analytics data available</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Advanced Analytics Dashboard
              </CardTitle>
              <CardDescription>
                Real-time insights and custom reports for your wedding event
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Last 24h</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchAnalyticsData}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportAnalytics('csv')}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Health</p>
                <Badge className={getStatusColor(analyticsData.realtimeMetrics.systemHealth)}>
                  {analyticsData.realtimeMetrics.systemHealth.toUpperCase()}
                </Badge>
              </div>
              <Activity className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold">{analyticsData.realtimeMetrics.activeUsers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Recent RSVPs</p>
                <p className="text-2xl font-bold">{analyticsData.realtimeMetrics.recentRsvps}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Confirmation Rate</p>
                <p className="text-2xl font-bold">{analyticsData.rsvpStats.confirmationRate}%</p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rsvp">RSVP Analytics</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="guests">Guest Insights</TabsTrigger>
          <TabsTrigger value="custom">Custom Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* RSVP Status Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>RSVP Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={rsvpChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {rsvpChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Wedding Side Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Wedding Side Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sideBreakdownData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {sideBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Daily RSVP Responses */}
          <Card>
            <CardHeader>
              <CardTitle>RSVP Response Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analyticsData.rsvpStats.dailyResponses}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* RSVP Analytics Tab */}
        <TabsContent value="rsvp" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Invitations</p>
                    <p className="text-3xl font-bold">{analyticsData.rsvpStats.total}</p>
                  </div>
                  <Mail className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Confirmed</p>
                    <p className="text-3xl font-bold text-green-600">{analyticsData.rsvpStats.confirmed}</p>
                  </div>
                  <UserCheck className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-3xl font-bold text-orange-600">{analyticsData.rsvpStats.pending}</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ceremony Attendance */}
          <Card>
            <CardHeader>
              <CardTitle>Ceremony Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analyticsData.ceremonyStats).map(([ceremony, stats]) => (
                  <div key={ceremony} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">{ceremony}</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{stats.attending}</p>
                        <p className="text-gray-600">Attending</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">{stats.notAttending}</p>
                        <p className="text-gray-600">Not Attending</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
                        <p className="text-gray-600">Pending</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Communication Tab */}
        <TabsContent value="communication" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Email Open Rate</p>
                    <p className="text-3xl font-bold">{analyticsData.communicationStats.openRate}%</p>
                  </div>
                  <Mail className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Click Rate</p>
                    <p className="text-3xl font-bold">{analyticsData.communicationStats.clickRate}%</p>
                  </div>
                  <Target className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Delivery Rate</p>
                    <p className="text-3xl font-bold">{analyticsData.communicationStats.deliveryRate}%</p>
                  </div>
                  <MessageCircle className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Communication Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Communication Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={communicationMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sent" fill="#8884d8" name="Sent" />
                  <Bar dataKey="opened" fill="#82ca9d" name="Opened" />
                  <Bar dataKey="clicked" fill="#ffc658" name="Clicked" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Guest Insights Tab */}
        <TabsContent value="guests" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Guests</p>
                    <p className="text-3xl font-bold">{analyticsData.guestStats.totalGuests}</p>
                  </div>
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Plus Ones</p>
                    <p className="text-3xl font-bold">{analyticsData.guestStats.plusOnes}</p>
                  </div>
                  <Heart className="h-8 w-8 text-pink-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Children</p>
                    <p className="text-3xl font-bold">{analyticsData.guestStats.children}</p>
                  </div>
                  <Users className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Need Accommodation</p>
                    <p className="text-3xl font-bold">{analyticsData.guestStats.accommodationNeeds}</p>
                  </div>
                  <MapPin className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Accommodation Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Accommodation Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold">{analyticsData.accommodationStats.totalRooms}</p>
                  <p className="text-gray-600">Total Rooms</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold">{analyticsData.accommodationStats.allocatedRooms}</p>
                  <p className="text-gray-600">Allocated</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold">{analyticsData.accommodationStats.occupancyRate}%</p>
                  <p className="text-gray-600">Occupancy Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Custom Reports Tab */}
        <TabsContent value="custom" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Custom Reports</CardTitle>
                  <CardDescription>Create and manage custom analytics reports</CardDescription>
                </div>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {customReports.length === 0 ? (
                <div className="text-center py-8">
                  <PieChartIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-gray-500">No custom reports created yet</p>
                  <Button variant="outline" className="mt-4">
                    Create Your First Report
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {customReports.map((report) => (
                    <Card key={report.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-2">{report.name}</h4>
                        <p className="text-sm text-gray-600 mb-3">{report.description}</p>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">{report.chartType}</Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}