import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  BarChart3, 
  FileDown, 
  Calendar, 
  Users, 
  TrendingUp, 
  PieChart,
  DollarSign,
  Mail,
  Phone,
  MapPin,
  Heart,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Download,
  Eye,
  Share2,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import DashboardLayout from "@/components/layout/dashboard-layout";
import ComprehensiveAnalytics from "@/components/analytics/comprehensive-analytics";
import { get } from "@/lib/api";

interface EventReport {
  id: number;
  title: string;
  date: string;
  totalGuests: number;
  confirmedGuests: number;
  pendingGuests: number;
  declinedGuests: number;
  responseRate: number;
  lastUpdated: string;
}

interface RSVPAnalytics {
  totalInvited: number;
  totalResponded: number;
  totalConfirmed: number;
  totalDeclined: number;
  totalPending: number;
  responseRate: number;
  confirmationRate: number;
  averageResponseTime: number;
  dailyResponses: { date: string; count: number }[];
  responseTimeDistribution: { range: string; count: number }[];
}

interface GuestAnalytics {
  demographics: {
    ageGroups: { range: string; count: number }[];
    genderDistribution: { type: string; count: number }[];
    locationDistribution: { city: string; count: number }[];
  };
  dietaryRequirements: {
    vegetarian: number;
    vegan: number;
    glutenFree: number;
    allergies: { allergen: string; count: number }[];
  };
  plusOnes: {
    withPlusOnes: number;
    withoutPlusOnes: number;
    averagePlusOnes: number;
  };
  communicationPreferences: {
    email: number;
    phone: number;
    whatsapp: number;
  };
}

interface FinancialReport {
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
  categoryBreakdown: {
    category: string;
    budgeted: number;
    spent: number;
    percentage: number;
  }[];
  costPerGuest: number;
  projectedFinalCost: number;
}

const RESPONSE_COLORS = {
  confirmed: "#10b981",
  declined: "#ef4444",
  pending: "#f59e0b"
};

export default function Reports() {
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("analytics");
  const [dateRange, setDateRange] = useState("all");

  // Fetch events for selection
  const { data: events = [] } = useQuery({
    queryKey: ['/api/events'],
    queryFn: () => get('/api/events'),
  });

  // Fetch event reports
  const { data: eventReports = [], isLoading: reportsLoading } = useQuery<EventReport[]>({
    queryKey: ['/api/reports/events'],
    queryFn: () => get('/api/reports/events'),
  });

  // Fetch RSVP analytics for selected event
  const { data: rsvpAnalytics, isLoading: rsvpLoading } = useQuery<RSVPAnalytics>({
    queryKey: ['/api/reports/rsvp-analytics', selectedEvent],
    queryFn: () => selectedEvent ? get(`/api/reports/rsvp-analytics?eventId=${selectedEvent}`) : Promise.resolve(null),
    enabled: !!selectedEvent
  });

  // Fetch guest analytics for selected event
  const { data: guestAnalytics, isLoading: guestLoading } = useQuery<GuestAnalytics>({
    queryKey: ['/api/reports/guest-analytics', selectedEvent],
    queryFn: () => selectedEvent ? get(`/api/reports/guest-analytics?eventId=${selectedEvent}`) : Promise.resolve(null),
    enabled: !!selectedEvent
  });

  // Fetch financial report for selected event
  const { data: financialReport, isLoading: financialLoading } = useQuery<FinancialReport>({
    queryKey: ['/api/reports/financial', selectedEvent],
    queryFn: () => selectedEvent ? get(`/api/reports/financial?eventId=${selectedEvent}`) : Promise.resolve(null),
    enabled: !!selectedEvent
  });

  const handleExportReport = (type: string) => {
    // Placeholder for export functionality
    console.log(`Exporting ${type} report for event ${selectedEvent}`);
  };

  if (!selectedEvent) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600 mt-2">
              Comprehensive insights and analytics for your wedding events
            </p>
          </div>

          {/* Event Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                  </CardContent>
                </Card>
              ))
            ) : eventReports.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="py-10">
                  <div className="flex flex-col items-center justify-center text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Reports Available</h3>
                    <p className="text-gray-600 mb-6">
                      Create an event with guests to see reports and analytics.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              eventReports.map((report) => (
                <Card 
                  key={report.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedEvent(report.id)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{new Date(report.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>{report.totalGuests} guests</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span>Response Rate</span>
                        <span className="font-medium">{report.responseRate}%</span>
                      </div>
                      <Progress value={report.responseRate} className="h-2" />
                    </div>

                    <div className="flex justify-between text-sm">
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>{report.confirmedGuests}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span>{report.declinedGuests}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4 text-yellow-600" />
                        <span>{report.pendingGuests}</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        View Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-20 flex-col">
                  <FileDown className="h-6 w-6 mb-2" />
                  Export All Reports
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Share2 className="h-6 w-6 mb-2" />
                  Share Analytics
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <RefreshCw className="h-6 w-6 mb-2" />
                  Refresh Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const selectedEventData = events.find((e: any) => e.id === selectedEvent);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Event Analytics</h1>
            <p className="text-gray-600 mt-2">
              Analyzing: {selectedEventData?.title}
            </p>
          </div>
          <div className="flex space-x-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => setSelectedEvent(null)}>
              Back to Overview
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="rsvp">RSVP Analytics</TabsTrigger>
            <TabsTrigger value="guests">Guest Insights</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <ComprehensiveAnalytics />
          </TabsContent>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Invited</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{rsvpAnalytics?.totalInvited || 0}</div>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Users className="h-3 w-3 mr-1" />
                    Including plus ones
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Response Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{rsvpAnalytics?.responseRate || 0}%</div>
                  <div className="flex items-center text-xs text-green-600 mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {rsvpAnalytics?.totalResponded || 0} responded
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Confirmed Guests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{rsvpAnalytics?.totalConfirmed || 0}</div>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {rsvpAnalytics?.confirmationRate || 0}% confirmation rate
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Avg Response Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{rsvpAnalytics?.averageResponseTime || 0}d</div>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    Days to respond
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* RSVP Status Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>RSVP Status Distribution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Confirmed</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{rsvpAnalytics?.totalConfirmed || 0}</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ 
                              width: `${((rsvpAnalytics?.totalConfirmed || 0) / (rsvpAnalytics?.totalInvited || 1)) * 100}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="text-sm">Declined</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{rsvpAnalytics?.totalDeclined || 0}</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-600 h-2 rounded-full" 
                            style={{ 
                              width: `${((rsvpAnalytics?.totalDeclined || 0) / (rsvpAnalytics?.totalInvited || 1)) * 100}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm">Pending</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{rsvpAnalytics?.totalPending || 0}</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-600 h-2 rounded-full" 
                            style={{ 
                              width: `${((rsvpAnalytics?.totalPending || 0) / (rsvpAnalytics?.totalInvited || 1)) * 100}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Response Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Interactive response timeline chart will be implemented in the next update.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* RSVP Analytics Tab */}
          <TabsContent value="rsvp" className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Detailed RSVP analytics including response patterns, communication effectiveness, and follow-up recommendations will be implemented in the next update.
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* Guest Insights Tab */}
          <TabsContent value="guests" className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Guest insights including demographics, dietary requirements, travel patterns, and accommodation preferences will be implemented in the next update.
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial" className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Financial reporting including budget tracking, cost per guest analysis, vendor payments, and expense forecasting will be implemented in the next update.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}