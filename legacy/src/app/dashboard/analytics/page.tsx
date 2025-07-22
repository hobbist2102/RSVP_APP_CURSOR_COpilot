'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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
  ResponsiveContainer 
} from 'recharts'
import { 
  TrendingUp, 
  Users, 
  Mail, 
  Calendar, 
  Download, 
  Filter,
  Eye,
  MessageSquare,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle2
} from 'lucide-react'

// Sample Analytics Data
const rsvpTrendsData = [
  { date: '2024-01-01', responses: 5, total: 5 },
  { date: '2024-01-02', responses: 12, total: 17 },
  { date: '2024-01-03', responses: 8, total: 25 },
  { date: '2024-01-04', responses: 15, total: 40 },
  { date: '2024-01-05', responses: 23, total: 63 },
  { date: '2024-01-06', responses: 18, total: 81 },
  { date: '2024-01-07', responses: 22, total: 103 }
]

const rsvpStatusData = [
  { name: 'Attending', value: 142, color: '#10b981' },
  { name: 'Not Attending', value: 28, color: '#ef4444' },
  { name: 'Maybe', value: 15, color: '#f59e0b' },
  { name: 'Pending', value: 65, color: '#6b7280' }
]

const guestSideData = [
  { name: "Bride's Side", attending: 85, notAttending: 12, maybe: 8 },
  { name: "Groom's Side", attending: 72, notAttending: 16, maybe: 7 },
  { name: "Mutual Friends", attending: 35, notAttending: 8, maybe: 4 }
]

const communicationData = [
  { date: '2024-01-01', emails: 250, whatsapp: 0, delivered: 248 },
  { date: '2024-01-05', emails: 89, whatsapp: 89, delivered: 175 },
  { date: '2024-01-10', emails: 156, whatsapp: 156, delivered: 308 },
  { date: '2024-01-15', emails: 67, whatsapp: 67, delivered: 132 }
]

const accommodationData = [
  { property: 'Grand Wedding Resort', assigned: 85, capacity: 120, rate: 70.8 },
  { property: 'Cozy Downtown Inn', assigned: 32, capacity: 50, rate: 64.0 },
  { property: 'Seaside Villa', assigned: 18, capacity: 25, rate: 72.0 },
  { property: 'Mountain Lodge', assigned: 12, capacity: 30, rate: 40.0 }
]

interface AnalyticsMetrics {
  totalGuests: number
  rsvpReceived: number
  rsvpRate: number
  attendingGuests: number
  attendanceRate: number
  communicationsSent: number
  deliveryRate: number
  accommodationOccupancy: number
  transportationUtilization: number
}

const sampleMetrics: AnalyticsMetrics = {
  totalGuests: 250,
  rsvpReceived: 185,
  rsvpRate: 74.0,
  attendingGuests: 142,
  attendanceRate: 76.8,
  communicationsSent: 650,
  deliveryRate: 94.2,
  accommodationOccupancy: 67.5,
  transportationUtilization: 82.3
}

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [dateRange, setDateRange] = useState('30d')

  const generateReport = (type: string) => {
    // In real app, this would generate and download actual reports
    console.log(`Generating ${type} report for ${dateRange}`)
  }

  const renderOverviewCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Guests</p>
              <p className="text-2xl font-bold">{sampleMetrics.totalGuests}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">RSVP Rate</p>
              <p className="text-2xl font-bold">{sampleMetrics.rsvpRate}%</p>
              <p className="text-xs text-green-600">+5.2% from last week</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Attending</p>
              <p className="text-2xl font-bold">{sampleMetrics.attendingGuests}</p>
              <p className="text-xs text-yellow-600">{sampleMetrics.attendanceRate}% acceptance</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Mail className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Delivery Rate</p>
              <p className="text-2xl font-bold">{sampleMetrics.deliveryRate}%</p>
              <p className="text-xs text-purple-600">{sampleMetrics.communicationsSent} sent</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <MapPin className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Occupancy</p>
              <p className="text-2xl font-bold">{sampleMetrics.accommodationOccupancy}%</p>
              <p className="text-xs text-red-600">Accommodations</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
              <p className="text-gray-600 mt-2">
                Comprehensive insights into your wedding event performance
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="rsvp">RSVP Analytics</TabsTrigger>
            <TabsTrigger value="communications">Communications</TabsTrigger>
            <TabsTrigger value="accommodations">Accommodations</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {renderOverviewCards()}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* RSVP Trends Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>RSVP Response Trends</CardTitle>
                  <CardDescription>Daily RSVP responses over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={rsvpTrendsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="responses" stroke="#3b82f6" strokeWidth={2} />
                      <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* RSVP Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>RSVP Status Distribution</CardTitle>
                  <CardDescription>Current breakdown of responses</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={rsvpStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {rsvpStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Guest Side Breakdown</CardTitle>
                <CardDescription>RSVP responses by guest affiliation</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={guestSideData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="attending" stackId="a" fill="#10b981" />
                    <Bar dataKey="notAttending" stackId="a" fill="#ef4444" />
                    <Bar dataKey="maybe" stackId="a" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* RSVP Analytics Tab */}
          <TabsContent value="rsvp" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600">{sampleMetrics.rsvpReceived}</div>
                  <div className="text-sm text-gray-600">Total Responses</div>
                  <div className="text-xs text-green-600 mt-1">
                    {((sampleMetrics.rsvpReceived / sampleMetrics.totalGuests) * 100).toFixed(1)}% response rate
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-600">{sampleMetrics.attendingGuests}</div>
                  <div className="text-sm text-gray-600">Confirmed Attending</div>
                  <div className="text-xs text-green-600 mt-1">
                    {sampleMetrics.attendanceRate}% acceptance rate
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-yellow-600">
                    {sampleMetrics.totalGuests - sampleMetrics.rsvpReceived}
                  </div>
                  <div className="text-sm text-gray-600">Pending Responses</div>
                  <div className="text-xs text-yellow-600 mt-1">
                    {(((sampleMetrics.totalGuests - sampleMetrics.rsvpReceived) / sampleMetrics.totalGuests) * 100).toFixed(1)}% pending
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>RSVP Response Timeline</CardTitle>
                <CardDescription>Track how responses have come in over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={rsvpTrendsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="responses" stroke="#3b82f6" strokeWidth={3} />
                    <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Guest Categories Performance</CardTitle>
                <CardDescription>RSVP rates by guest relationship</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Total Invited</TableHead>
                      <TableHead>Responded</TableHead>
                      <TableHead>Response Rate</TableHead>
                      <TableHead>Attending</TableHead>
                      <TableHead>Acceptance Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Family</TableCell>
                      <TableCell>85</TableCell>
                      <TableCell>78</TableCell>
                      <TableCell>
                        <Badge variant="success">91.8%</Badge>
                      </TableCell>
                      <TableCell>72</TableCell>
                      <TableCell>
                        <Badge variant="success">92.3%</Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Friends</TableCell>
                      <TableCell>120</TableCell>
                      <TableCell>82</TableCell>
                      <TableCell>
                        <Badge variant="warning">68.3%</Badge>
                      </TableCell>
                      <TableCell>58</TableCell>
                      <TableCell>
                        <Badge variant="warning">70.7%</Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Colleagues</TableCell>
                      <TableCell>35</TableCell>
                      <TableCell>20</TableCell>
                      <TableCell>
                        <Badge variant="destructive">57.1%</Badge>
                      </TableCell>
                      <TableCell>12</TableCell>
                      <TableCell>
                        <Badge variant="destructive">60.0%</Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Other</TableCell>
                      <TableCell>10</TableCell>
                      <TableCell>5</TableCell>
                      <TableCell>
                        <Badge variant="secondary">50.0%</Badge>
                      </TableCell>
                      <TableCell>3</TableCell>
                      <TableCell>
                        <Badge variant="secondary">60.0%</Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Communications Tab */}
          <TabsContent value="communications" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-purple-600">{sampleMetrics.communicationsSent}</div>
                  <div className="text-sm text-gray-600">Total Messages Sent</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-600">{sampleMetrics.deliveryRate}%</div>
                  <div className="text-sm text-gray-600">Delivery Rate</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600">72%</div>
                  <div className="text-sm text-gray-600">Open Rate</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Communication Timeline</CardTitle>
                <CardDescription>Messages sent over time by channel</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={communicationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="emails" fill="#3b82f6" />
                    <Bar dataKey="whatsapp" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Accommodations Tab */}
          <TabsContent value="accommodations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Accommodation Occupancy</CardTitle>
                <CardDescription>Current occupancy rates by property</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>Assigned Guests</TableHead>
                      <TableHead>Total Capacity</TableHead>
                      <TableHead>Occupancy Rate</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accommodationData.map((property) => (
                      <TableRow key={property.property}>
                        <TableCell className="font-medium">{property.property}</TableCell>
                        <TableCell>{property.assigned}</TableCell>
                        <TableCell>{property.capacity}</TableCell>
                        <TableCell>
                          <Badge variant={property.rate > 70 ? 'destructive' : property.rate > 50 ? 'warning' : 'success'}>
                            {property.rate.toFixed(1)}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {property.rate > 90 ? 'Nearly Full' : property.rate > 70 ? 'High Occupancy' : 'Available'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => generateReport('rsvp-summary')}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>RSVP Summary Report</span>
                  </CardTitle>
                  <CardDescription>
                    Complete overview of RSVP responses, trends, and statistics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Generate Report
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => generateReport('guest-analytics')}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Guest Analytics</span>
                  </CardTitle>
                  <CardDescription>
                    Detailed breakdown of guest demographics and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Generate Report
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => generateReport('communication')}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5" />
                    <span>Communication Report</span>
                  </CardTitle>
                  <CardDescription>
                    Message delivery rates, engagement metrics, and channel performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Generate Report
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => generateReport('accommodation')}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5" />
                    <span>Accommodation Report</span>
                  </CardTitle>
                  <CardDescription>
                    Room assignments, occupancy rates, and booking summaries
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Generate Report
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => generateReport('cost-analysis')}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <DollarSign className="w-5 h-5" />
                    <span>Cost Analysis</span>
                  </CardTitle>
                  <CardDescription>
                    Budget tracking, vendor costs, and financial summaries
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Generate Report
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => generateReport('complete')}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>Complete Analytics</span>
                  </CardTitle>
                  <CardDescription>
                    Comprehensive report with all metrics and insights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Generate Complete Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}