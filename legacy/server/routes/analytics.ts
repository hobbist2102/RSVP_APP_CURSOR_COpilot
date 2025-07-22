import { Router } from 'express';
import { z } from 'zod';
import { AnalyticsService } from '../services/analytics-service';
import { isAuthenticated } from './auth';

const router = Router();

// Get comprehensive analytics for an event
router.get('/comprehensive/:eventId', isAuthenticated, async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    
    if (isNaN(eventId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID'
      });
    }

    const analytics = await AnalyticsService.getComprehensiveAnalytics(eventId);
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching comprehensive analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics data'
    });
  }
});

// Get RSVP metrics only
router.get('/rsvp/:eventId', isAuthenticated, async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    
    if (isNaN(eventId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID'
      });
    }

    const rsvpMetrics = await AnalyticsService.getRSVPMetrics(eventId);
    
    res.json({
      success: true,
      data: rsvpMetrics
    });
  } catch (error) {
    console.error('Error fetching RSVP metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch RSVP metrics'
    });
  }
});

// Get guest analytics only
router.get('/guests/:eventId', isAuthenticated, async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    
    if (isNaN(eventId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID'
      });
    }

    const guestAnalytics = await AnalyticsService.getGuestAnalytics(eventId);
    
    res.json({
      success: true,
      data: guestAnalytics
    });
  } catch (error) {
    console.error('Error fetching guest analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch guest analytics'
    });
  }
});

// Get timeline analytics
router.get('/timeline/:eventId', isAuthenticated, async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    
    if (isNaN(eventId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID'
      });
    }

    const timelineAnalytics = await AnalyticsService.getTimelineAnalytics(eventId);
    
    res.json({
      success: true,
      data: timelineAnalytics
    });
  } catch (error) {
    console.error('Error fetching timeline analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch timeline analytics'
    });
  }
});

// Get engagement metrics
router.get('/engagement/:eventId', isAuthenticated, async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    
    if (isNaN(eventId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID'
      });
    }

    const engagementMetrics = await AnalyticsService.getEngagementMetrics(eventId);
    
    res.json({
      success: true,
      data: engagementMetrics
    });
  } catch (error) {
    console.error('Error fetching engagement metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch engagement metrics'
    });
  }
});

// Get logistics analytics
router.get('/logistics/:eventId', isAuthenticated, async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    
    if (isNaN(eventId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID'
      });
    }

    const logisticsAnalytics = await AnalyticsService.getLogisticsAnalytics(eventId);
    
    res.json({
      success: true,
      data: logisticsAnalytics
    });
  } catch (error) {
    console.error('Error fetching logistics analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch logistics analytics'
    });
  }
});

// Get financial projections
router.get('/financial/:eventId', isAuthenticated, async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    
    if (isNaN(eventId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID'
      });
    }

    const financialProjections = await AnalyticsService.getFinancialProjections(eventId);
    
    res.json({
      success: true,
      data: financialProjections
    });
  } catch (error) {
    console.error('Error fetching financial projections:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch financial projections'
    });
  }
});

// Generate insights and recommendations
router.get('/insights/:eventId', isAuthenticated, async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    
    if (isNaN(eventId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID'
      });
    }

    const insights = await AnalyticsService.generateInsights(eventId);
    
    res.json({
      success: true,
      data: insights
    });
  } catch (error) {
    console.error('Error generating insights:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate insights'
    });
  }
});

// Export analytics data (CSV/Excel)
router.get('/export/:eventId', isAuthenticated, async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const format = req.query.format as string || 'json';
    
    if (isNaN(eventId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID'
      });
    }

    const analytics = await AnalyticsService.getComprehensiveAnalytics(eventId);
    
    if (format === 'csv') {
      // Convert to CSV format
      const csvData = convertToCSV(analytics);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="event-analytics-${eventId}.csv"`);
      res.send(csvData);
    } else if (format === 'excel') {
      // This would require a library like exceljs
      res.status(501).json({
        success: false,
        message: 'Excel export not yet implemented'
      });
    } else {
      // Default to JSON
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="event-analytics-${eventId}.json"`);
      res.json(analytics);
    }
  } catch (error) {
    console.error('Error exporting analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export analytics data'
    });
  }
});

// Helper function to convert analytics to CSV
function convertToCSV(analytics: any): string {
  const csvRows: string[] = [];
  
  // Add RSVP metrics
  csvRows.push('RSVP Metrics');
  csvRows.push('Metric,Value');
  csvRows.push(`Total Invited,${analytics.rsvpMetrics.totalInvited}`);
  csvRows.push(`Total Responded,${analytics.rsvpMetrics.totalResponded}`);
  csvRows.push(`Total Confirmed,${analytics.rsvpMetrics.totalConfirmed}`);
  csvRows.push(`Total Declined,${analytics.rsvpMetrics.totalDeclined}`);
  csvRows.push(`Response Rate,${analytics.rsvpMetrics.responseRate}%`);
  csvRows.push(`Confirmation Rate,${analytics.rsvpMetrics.confirmationRate}%`);
  csvRows.push('');
  
  // Add guest analytics
  csvRows.push('Guest Analytics');
  csvRows.push('Metric,Value');
  csvRows.push(`Total Guests,${analytics.guestAnalytics.demographics.totalGuests}`);
  csvRows.push(`Total Families,${analytics.guestAnalytics.demographics.totalFamilies}`);
  csvRows.push(`Average Family Size,${analytics.guestAnalytics.demographics.averageFamilySize}`);
  csvRows.push(`Dietary Requests,${analytics.guestAnalytics.dietary.totalDietaryRequests}`);
  csvRows.push(`Total Travelers,${analytics.guestAnalytics.travel.totalTravelers}`);
  csvRows.push('');
  
  return csvRows.join('\n');
}

export default router;