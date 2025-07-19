import { db } from '../db';
import { 
  guests, 
  guestCeremonies, 
  weddingEvents, 
  ceremonies, 
  users,
  guestTravelInfo
} from '../../shared/schema';
import { eq, and, sql, desc, asc } from 'drizzle-orm';

export interface AnalyticsMetrics {
  rsvpMetrics: RSVPMetrics;
  guestAnalytics: GuestAnalytics;
  timelineAnalytics: TimelineAnalytics;
  engagementMetrics: EngagementMetrics;
  logisticsAnalytics: LogisticsAnalytics;
  financialProjections: FinancialProjections;
}

export interface RSVPMetrics {
  totalInvited: number;
  totalResponded: number;
  totalConfirmed: number;
  totalDeclined: number;
  totalPending: number;
  responseRate: number;
  confirmationRate: number;
  averageResponseTime: number;
  dailyResponses: { date: string; responses: number; confirmations: number }[];
  ceremonyBreakdown: { ceremonyName: string; confirmed: number; declined: number }[];
  familyResponseRates: { familyGroup: string; responseRate: number; totalInvited: number }[];
}

export interface GuestAnalytics {
  demographics: {
    totalGuests: number;
    totalFamilies: number;
    averageFamilySize: number;
    guestsByRelationship: { relationship: string; count: number }[];
    ageDistribution: { ageRange: string; count: number }[];
  };
  dietary: {
    totalDietaryRequests: number;
    dietaryBreakdown: { type: string; count: number }[];
    specialRequests: { requirement: string; count: number }[];
  };
  accommodation: {
    totalNeedingAccommodation: number;
    accommodationBreakdown: { type: string; count: number }[];
    averageStayDuration: number;
  };
  travel: {
    totalTravelers: number;
    travelModes: { mode: string; count: number }[];
    originCities: { city: string; count: number }[];
    flightCoordination: { needsAssistance: number; coordinated: number }[];
  };
}

export interface TimelineAnalytics {
  rsvpTrends: {
    week: string;
    newResponses: number;
    cumulativeResponses: number;
    responseRate: number;
  }[];
  communicationEffectiveness: {
    channel: string;
    sent: number;
    opened: number;
    responded: number;
    conversionRate: number;
  }[];
  milestones: {
    date: string;
    milestone: string;
    impact: string;
  }[];
}

export interface EngagementMetrics {
  communicationStats: {
    totalCommunications: number;
    responseRates: { channel: string; rate: number }[];
    optimalSendTimes: { hour: number; responseRate: number }[];
  };
  userActivity: {
    activeUsers: number;
    averageSessionDuration: number;
    featureUsage: { feature: string; usageCount: number }[];
  };
  guestEngagement: {
    portalUsage: number;
    selfServiceActions: number;
    supportTickets: number;
  };
}

export interface LogisticsAnalytics {
  accommodation: {
    totalRooms: number;
    occupancyRate: number;
    roomTypeDistribution: { type: string; booked: number; available: number }[];
  };
  transportation: {
    totalGuests: number;
    transportationRequired: number;
    routeEfficiency: { route: string; utilization: number }[];
    costPerGuest: number;
  };
  catering: {
    totalMeals: number;
    mealTypeBreakdown: { mealType: string; count: number }[];
    dietaryAccommodation: number;
  };
}

export interface FinancialProjections {
  budget: {
    totalBudget: number;
    spentToDate: number;
    projected: number;
    remainingBudget: number;
  };
  costBreakdown: {
    category: string;
    budgeted: number;
    actual: number;
    projected: number;
  }[];
  costPerGuest: {
    confirmed: number;
    projected: number;
    industry_average: number;
  };
  savings: {
    totalSavings: number;
    savingsByCategory: { category: string; amount: number }[];
  };
}

export class AnalyticsService {
  static async getComprehensiveAnalytics(eventId: number): Promise<AnalyticsMetrics> {
    const [
      rsvpMetrics,
      guestAnalytics,
      timelineAnalytics,
      engagementMetrics,
      logisticsAnalytics,
      financialProjections
    ] = await Promise.all([
      this.getRSVPMetrics(eventId),
      this.getGuestAnalytics(eventId),
      this.getTimelineAnalytics(eventId),
      this.getEngagementMetrics(eventId),
      this.getLogisticsAnalytics(eventId),
      this.getFinancialProjections(eventId)
    ]);

    return {
      rsvpMetrics,
      guestAnalytics,
      timelineAnalytics,
      engagementMetrics,
      logisticsAnalytics,
      financialProjections
    };
  }

  static async getRSVPMetrics(eventId: number): Promise<RSVPMetrics> {
    // Get basic RSVP counts
    const rsvpCounts = await db
      .select({
        totalInvited: sql<number>`COUNT(DISTINCT ${guests.id})`,
        totalResponded: sql<number>`COUNT(DISTINCT CASE WHEN ${guestCeremonies.attending} IS NOT NULL THEN ${guests.id} END)`,
        totalConfirmed: sql<number>`COUNT(DISTINCT CASE WHEN ${guestCeremonies.attending} = true THEN ${guests.id} END)`,
        totalDeclined: sql<number>`COUNT(DISTINCT CASE WHEN ${guestCeremonies.attending} = false THEN ${guests.id} END)`
      })
      .from(guests)
      .leftJoin(guestCeremonies, eq(guests.id, guestCeremonies.guestId))
      .where(eq(guests.eventId, eventId))
      .groupBy()
      .execute();

    const counts = rsvpCounts[0] || { totalInvited: 0, totalResponded: 0, totalConfirmed: 0, totalDeclined: 0 };
    const totalPending = counts.totalInvited - counts.totalResponded;
    const responseRate = counts.totalInvited > 0 ? (counts.totalResponded / counts.totalInvited) * 100 : 0;
    const confirmationRate = counts.totalResponded > 0 ? (counts.totalConfirmed / counts.totalResponded) * 100 : 0;

    // Get daily response trends
    const dailyResponses = await db
      .select({
        date: sql<string>`DATE(${guestCeremonies.id})`, // Use ID as proxy for creation date
        responses: sql<number>`COUNT(*)`,
        confirmations: sql<number>`COUNT(CASE WHEN ${guestCeremonies.attending} = true THEN 1 END)`
      })
      .from(guestCeremonies)
      .innerJoin(guests, eq(guestCeremonies.guestId, guests.id))
      .where(eq(guests.eventId, eventId))
      .groupBy(sql`DATE(${guestCeremonies.id})`)
      .orderBy(sql`DATE(${guestCeremonies.id})`)
      .execute();

    // Get ceremony breakdown
    const ceremonyBreakdown = await db
      .select({
        ceremonyName: ceremonies.name,
        confirmed: sql<number>`COUNT(CASE WHEN ${guestCeremonies.attending} = true THEN 1 END)`,
        declined: sql<number>`COUNT(CASE WHEN ${guestCeremonies.attending} = false THEN 1 END)`
      })
      .from(ceremonies)
      .leftJoin(guestCeremonies, eq(ceremonies.id, guestCeremonies.ceremonyId))
      .leftJoin(guests, eq(guestCeremonies.guestId, guests.id))
      .where(eq(guests.eventId, eventId))
      .groupBy(ceremonies.id, ceremonies.name)
      .execute();

    return {
      totalInvited: counts.totalInvited,
      totalResponded: counts.totalResponded,
      totalConfirmed: counts.totalConfirmed,
      totalDeclined: counts.totalDeclined,
      totalPending,
      responseRate: Math.round(responseRate * 100) / 100,
      confirmationRate: Math.round(confirmationRate * 100) / 100,
      averageResponseTime: 0, // This would require tracking response timestamps
      dailyResponses: dailyResponses.map(d => ({
        date: d.date,
        responses: d.responses,
        confirmations: d.confirmations
      })),
      ceremonyBreakdown: ceremonyBreakdown.map(c => ({
        ceremonyName: c.ceremonyName,
        confirmed: c.confirmed,
        declined: c.declined
      })),
      familyResponseRates: [] // This would require family grouping logic
    };
  }

  static async getGuestAnalytics(eventId: number): Promise<GuestAnalytics> {
    // Basic demographics
    const demographics = await db
      .select({
        totalGuests: sql<number>`COUNT(DISTINCT ${guests.id})`,
        totalFamilies: sql<number>`COUNT(DISTINCT ${guests.familyId})`,
        relationshipBreakdown: sql<string>`${guests.relationshipToCouple}`
      })
      .from(guests)
      .where(eq(guests.eventId, eventId))
      .groupBy(guests.relationshipToCouple)
      .execute();

    // Dietary requirements
    const dietaryBreakdown = await db
      .select({
        dietaryRequirement: guests.dietaryRequirements,
        count: sql<number>`COUNT(*)`
      })
      .from(guests)
      .where(and(
        eq(guests.eventId, eventId),
        sql`${guests.dietaryRequirements} IS NOT NULL AND ${guests.dietaryRequirements} != ''`
      ))
      .groupBy(guests.dietaryRequirements)
      .execute();

    // Travel information
    const travelBreakdown = await db
      .select({
        travelMode: guestTravelInfo.travelMode,
        count: sql<number>`COUNT(*)`
      })
      .from(guestTravelInfo)
      .innerJoin(guests, eq(guestTravelInfo.guestId, guests.id))
      .where(eq(guests.eventId, eventId))
      .groupBy(guestTravelInfo.travelMode)
      .execute();

    const totalGuests = demographics.reduce((sum, d) => sum + d.totalGuests, 0);
    const totalFamilies = Math.max(...demographics.map(d => d.totalFamilies));

    return {
      demographics: {
        totalGuests,
        totalFamilies,
        averageFamilySize: totalFamilies > 0 ? Math.round((totalGuests / totalFamilies) * 100) / 100 : 0,
        guestsByRelationship: demographics.map(d => ({
          relationship: d.relationshipBreakdown || 'Not specified',
          count: d.totalGuests
        })),
        ageDistribution: [] // Would require age field
      },
      dietary: {
        totalDietaryRequests: dietaryBreakdown.reduce((sum, d) => sum + d.count, 0),
        dietaryBreakdown: dietaryBreakdown.map(d => ({
          type: d.dietaryRequirement || 'Not specified',
          count: d.count
        })),
        specialRequests: []
      },
      accommodation: {
        totalNeedingAccommodation: 0, // Would require accommodation tracking
        accommodationBreakdown: [],
        averageStayDuration: 0
      },
      travel: {
        totalTravelers: travelBreakdown.reduce((sum, t) => sum + t.count, 0),
        travelModes: travelBreakdown.map(t => ({
          mode: t.travelMode || 'Not specified',
          count: t.count
        })),
        originCities: [],
        flightCoordination: []
      }
    };
  }

  static async getTimelineAnalytics(eventId: number): Promise<TimelineAnalytics> {
    // Weekly RSVP trends - simplified for now
    const weeklyTrends = await db
      .select({
        week: sql<string>`DATE_TRUNC('week', CURRENT_DATE)`,
        newResponses: sql<number>`COUNT(*)`,
        cumulativeResponses: sql<number>`COUNT(*)`
      })
      .from(guestCeremonies)
      .innerJoin(guests, eq(guestCeremonies.guestId, guests.id))
      .where(eq(guests.eventId, eventId))
      .groupBy(sql`DATE_TRUNC('week', CURRENT_DATE)`)
      .orderBy(sql`DATE_TRUNC('week', CURRENT_DATE)`)
      .execute();

    return {
      rsvpTrends: weeklyTrends.map(t => ({
        week: t.week,
        newResponses: t.newResponses,
        cumulativeResponses: t.cumulativeResponses,
        responseRate: 0 // Would require total invited count per week
      })),
      communicationEffectiveness: [],
      milestones: []
    };
  }

  static async getEngagementMetrics(eventId: number): Promise<EngagementMetrics> {
    return {
      communicationStats: {
        totalCommunications: 0,
        responseRates: [],
        optimalSendTimes: []
      },
      userActivity: {
        activeUsers: 0,
        averageSessionDuration: 0,
        featureUsage: []
      },
      guestEngagement: {
        portalUsage: 0,
        selfServiceActions: 0,
        supportTickets: 0
      }
    };
  }

  static async getLogisticsAnalytics(eventId: number): Promise<LogisticsAnalytics> {
    return {
      accommodation: {
        totalRooms: 0,
        occupancyRate: 0,
        roomTypeDistribution: []
      },
      transportation: {
        totalGuests: 0,
        transportationRequired: 0,
        routeEfficiency: [],
        costPerGuest: 0
      },
      catering: {
        totalMeals: 0,
        mealTypeBreakdown: [],
        dietaryAccommodation: 0
      }
    };
  }

  static async getFinancialProjections(eventId: number): Promise<FinancialProjections> {
    return {
      budget: {
        totalBudget: 0,
        spentToDate: 0,
        projected: 0,
        remainingBudget: 0
      },
      costBreakdown: [],
      costPerGuest: {
        confirmed: 0,
        projected: 0,
        industry_average: 150 // Example industry average
      },
      savings: {
        totalSavings: 0,
        savingsByCategory: []
      }
    };
  }

  // Generate insights and recommendations
  static async generateInsights(eventId: number): Promise<string[]> {
    const metrics = await this.getComprehensiveAnalytics(eventId);
    const insights: string[] = [];

    // RSVP insights
    if (metrics.rsvpMetrics.responseRate > 80) {
      insights.push("🎉 Excellent response rate! Your guests are highly engaged.");
    } else if (metrics.rsvpMetrics.responseRate < 50) {
      insights.push("📧 Consider sending follow-up communications to boost response rates.");
    }

    // Guest insights
    if (metrics.guestAnalytics.dietary.totalDietaryRequests > 0) {
      const dietaryRate = (metrics.guestAnalytics.dietary.totalDietaryRequests / metrics.guestAnalytics.demographics.totalGuests) * 100;
      if (dietaryRate > 20) {
        insights.push("🥗 High number of dietary requirements - ensure catering can accommodate all needs.");
      }
    }

    // Travel insights
    if (metrics.guestAnalytics.travel.totalTravelers > 0) {
      const travelRate = (metrics.guestAnalytics.travel.totalTravelers / metrics.guestAnalytics.demographics.totalGuests) * 100;
      if (travelRate > 30) {
        insights.push("✈️ Many guests are traveling - consider providing travel coordination assistance.");
      }
    }

    return insights;
  }
}