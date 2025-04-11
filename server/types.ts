import { SessionData } from 'express-session';

// Extend the Session interface to include our custom fields
declare module 'express-session' {
  interface SessionData {
    currentEvent?: {
      id: number;
      title: string;
      startDate: string;
      endDate: string;
      coupleNames: string;
      brideName: string;
      groomName: string;
      location: string;
      description?: string;
      [key: string]: any;
    };
  }
}

// Export any other custom types here