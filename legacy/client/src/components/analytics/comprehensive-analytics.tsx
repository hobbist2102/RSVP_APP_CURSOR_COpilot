import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Users, 
  Mail, 
  Calendar,
  DollarSign,
  Plane,
  MapPin,
  Utensils,
  Download,
  RefreshCw,
  Lightbulb,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { get } from '@/lib/api';
import { useCurrentEvent } from '@/hooks/use-current-event';

interface AnalyticsMetrics {
  rsvpMetrics: {
    totalInvited: number;
    totalResponded: number;
    totalConfirmed: number;
    totalDeclined: number;
    totalPending: number;
    responseRate: number;
    confirmationRate: number;
    dailyResponses: { date: string; responses: number; confirmations: number }[];
    ceremonyBreakdown: { ceremonyName: string; confirmed: number; declined: number }[];
  };
  guestAnalytics: {
    demographics: {
      totalGuests: number;
      totalFamilies: number;
      averageFamilySize: number;
      guestsByRelationship: { relationship: string; count: number }[];
    };
    dietary: {
      totalDietaryRequests: number;
      dietaryBreakdown: { type: string; count: number }[];
    };
    travel: {
      totalTravelers: number;
      travelModes: { mode: string; count: number }[];
    };
  };
  timelineAnalytics: {
    rsvpTrends: {
      week: string;
      newResponses: number;
      cumulativeResponses: number;
    }[];
  };
}

export default function ComprehensiveAnalytics() {
  const [activeTab, setActiveTab] = useState('overview');
  const [exportFormat, setExportFormat] = useState('json');
  const { currentEvent } = useCurrentEvent();

  // Fetch comprehensive analytics
  const { data: analytics, isLoading, refetch } = useQuery<AnalyticsMetrics>({
    queryKey: ['analytics', 'comprehensive', currentEvent?.id],
    queryFn: async () => {
      if (!currentEvent?.id) throw new Error('No event selected');
      const response = await get(`/api/analytics/comprehensive/${currentEvent.id}`);
      return response.data;
    },
    enabled: !!currentEvent?.id
  });

  // Fetch insights
  const { data: insights } = useQuery<string[]>({
    queryKey: ['analytics', 'insights', currentEvent?.id],
    queryFn: async () => {
      if (!currentEvent?.id) throw new Error('No event selected');
      const response = await get(`/api/analytics/insights/${currentEvent.id}`);
      return response.data;
    },
    enabled: !!currentEvent?.id
  });

  const handleExport = async () => {
    if (!currentEvent?.id) return;
    
    try {
      const response = await fetch(`/api/analytics/export/${currentEvent.id}?format=${exportFormat}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `event-analytics-${currentEvent.id}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (!currentEvent) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Event Selected</h3>
            <p className="text-gray-600">Please select an event to view analytics.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Analytics Unavailable</h3>
            <p className="text-gray-600">Unable to load analytics data. Please try again.</p>
            <Button onClick={() => refetch()} className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Event Analytics</h2>
          <p className="text-muted-foreground">Comprehensive insights for {currentEvent.title}</p>
        </div>
        <div className="flex gap-2">
          <Select value={exportFormat} onValueChange={setExportFormat}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="json">JSON</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* AI Insights */}
      {insights && insights.length > 0 && (
        <Card className="border-purple-200 bg-purple-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <Lightbulb className="h-5 w-5" />
              AI Insights & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-purple-700">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rsvp">RSVP Analysis</TabsTrigger>
          <TabsTrigger value="guests">Guest Insights</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Invited</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.rsvpMetrics.totalInvited}</div>
                <p className="text-xs text-muted-foreground">
                  Across {analytics.guestAnalytics.demographics.totalFamilies} families
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.rsvpMetrics.responseRate.toFixed(1)}%</div>
                <Progress 
                  value={analytics.rsvpMetrics.responseRate} 
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Confirmed Guests</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{analytics.rsvpMetrics.totalConfirmed}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.rsvpMetrics.confirmationRate.toFixed(1)}% confirmation rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Travelers</CardTitle>
                <Plane className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.guestAnalytics.travel.totalTravelers}</div>
                <p className="text-xs text-muted-foreground">
                  Require travel coordination
                </p>
              </CardContent>
            </Card>
          </div>

          {/* RSVP Status Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>RSVP Status Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>Confirmed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{analytics.rsvpMetrics.totalConfirmed}</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {((analytics.rsvpMetrics.totalConfirmed / analytics.rsvpMetrics.totalInvited) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span>Declined</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{analytics.rsvpMetrics.totalDeclined}</span>
                    <Badge variant="secondary" className="bg-red-100 text-red-800">
                      {((analytics.rsvpMetrics.totalDeclined / analytics.rsvpMetrics.totalInvited) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                    <span>Pending</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{analytics.rsvpMetrics.totalPending}</span>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      {((analytics.rsvpMetrics.totalPending / analytics.rsvpMetrics.totalInvited) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* RSVP Analysis Tab */}
        <TabsContent value="rsvp" className="space-y-6">
          {/* Ceremony Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Ceremony Attendance</CardTitle>
              <CardDescription>RSVP breakdown by ceremony</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.rsvpMetrics.ceremonyBreakdown.map((ceremony, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">{ceremony.ceremonyName}</h4>
                      <span className="text-sm text-muted-foreground">
                        {ceremony.confirmed + ceremony.declined} responses
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                        <span className="text-sm text-green-700">Confirmed</span>
                        <span className="font-medium text-green-800">{ceremony.confirmed}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                        <span className="text-sm text-red-700">Declined</span>
                        <span className="font-medium text-red-800">{ceremony.declined}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Daily Response Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Response Timeline</CardTitle>
              <CardDescription>Daily RSVP activity</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.rsvpMetrics.dailyResponses.length > 0 ? (
                <div className="space-y-2">
                  {analytics.rsvpMetrics.dailyResponses.slice(-7).map((day, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{new Date(day.date).toLocaleDateString()}</span>
                      <div className="flex gap-4 text-sm">
                        <span>{day.responses} responses</span>
                        <span className="text-green-600">{day.confirmations} confirmed</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No response data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Guest Insights Tab */}
        <TabsContent value="guests" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Demographics */}
            <Card>
              <CardHeader>
                <CardTitle>Guest Demographics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Guests</span>
                    <span className="font-medium">{analytics.guestAnalytics.demographics.totalGuests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Families</span>
                    <span className="font-medium">{analytics.guestAnalytics.demographics.totalFamilies}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Family Size</span>
                    <span className="font-medium">{analytics.guestAnalytics.demographics.averageFamilySize}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dietary Requirements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="h-4 w-4" />
                  Dietary Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Requests</span>
                    <span className="font-medium">{analytics.guestAnalytics.dietary.totalDietaryRequests}</span>
                  </div>
                  {analytics.guestAnalytics.dietary.dietaryBreakdown.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="capitalize">{item.type}</span>
                      <span>{item.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Relationship Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Guest Relationships</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {analytics.guestAnalytics.demographics.guestsByRelationship.map((rel, index) => (
                  <div key={index} className="text-center p-4 border rounded">
                    <div className="text-2xl font-bold">{rel.count}</div>
                    <div className="text-sm text-muted-foreground capitalize">{rel.relationship}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Travel Modes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plane className="h-4 w-4" />
                Travel Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Travelers</span>
                  <span className="font-medium">{analytics.guestAnalytics.travel.totalTravelers}</span>
                </div>
                {analytics.guestAnalytics.travel.travelModes.map((mode, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="capitalize">{mode.mode}</span>
                    <Badge variant="outline">{mode.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>RSVP Trends Over Time</CardTitle>
              <CardDescription>Weekly response patterns</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.timelineAnalytics.rsvpTrends.length > 0 ? (
                <div className="space-y-2">
                  {analytics.timelineAnalytics.rsvpTrends.map((week, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <span className="text-sm">{new Date(week.week).toLocaleDateString()}</span>
                      <div className="flex gap-4 text-sm">
                        <span>{week.newResponses} new</span>
                        <span className="text-purple-600">{week.cumulativeResponses} total</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No timeline data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}