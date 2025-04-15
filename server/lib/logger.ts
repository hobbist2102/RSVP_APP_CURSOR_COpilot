/**
 * Centralized logging service using Winston
 * Provides structured logging with context for better debugging and monitoring
 */

import winston from 'winston';
import { Request } from 'express';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Add colors to winston
winston.addColors(colors);

// Define the format for logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define which transports the logger must use
const transports = [
  // Console transport for all logs
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        // Special handling for objects and errors
        if (meta.error && meta.error instanceof Error) {
          return `${timestamp} ${level}: ${message} - ${meta.error.stack}`;
        }
        
        const metaString = Object.keys(meta).length ? 
          `\n${JSON.stringify(meta, null, 2)}` : '';
          
        return `${timestamp} ${level}: ${message}${metaString}`;
      })
    ),
  }),
  
  // Add file transport for error logs
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    format: winston.format.combine(
      winston.format.uncolorize(),
      winston.format.json()
    )
  }),
  
  // Add file transport for all logs
  new winston.transports.File({ 
    filename: 'logs/all.log',
    format: winston.format.combine(
      winston.format.uncolorize(),
      winston.format.json()
    )
  }),
];

// Create the logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  levels,
  format,
  transports,
});

/**
 * Extract context info from request for structured logging
 * @param req Express request object
 * @returns Context object with user, session, and request info
 */
const getRequestContext = (req: Request): Record<string, any> => {
  const context: Record<string, any> = {
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  };
  
  // Add authenticated user info if available
  if (req.isAuthenticated && req.isAuthenticated() && req.user) {
    context.userId = (req.user as any).id;
    context.username = (req.user as any).username;
  }
  
  // Add session info if available
  if (req.session) {
    context.sessionId = req.sessionID;
    
    // If session has current event, include it
    if ((req.session as any).currentEventId) {
      context.eventId = (req.session as any).currentEventId;
    }
  }
  
  return context;
};

/**
 * OAuth-specific logger with context for better debugging
 * @param eventId Event ID associated with the OAuth operation
 * @param provider OAuth provider (gmail, outlook)
 * @param action Action being performed (authorize, callback, token-refresh)
 * @returns Logger with pre-configured context
 */
export const createOAuthLogger = (
  eventId?: number | string, 
  provider?: string, 
  action?: string
) => {
  // Create base context
  const context: Record<string, any> = {};
  
  if (eventId) context.eventId = eventId;
  if (provider) context.provider = provider;
  if (action) context.action = action;
  
  // Return specialized logging functions with context
  return {
    info: (message: string, additionalContext: Record<string, any> = {}) => {
      logger.info(message, { ...context, ...additionalContext });
    },
    
    error: (message: string, error?: Error, additionalContext: Record<string, any> = {}) => {
      logger.error(message, { 
        ...context, 
        ...additionalContext, 
        error: error ? { 
          message: error.message, 
          stack: error.stack,
          name: error.name
        } : undefined 
      });
    },
    
    warn: (message: string, additionalContext: Record<string, any> = {}) => {
      logger.warn(message, { ...context, ...additionalContext });
    },
    
    debug: (message: string, additionalContext: Record<string, any> = {}) => {
      logger.debug(message, { ...context, ...additionalContext });
    },
    
    // Add request context and log
    request: (message: string, req: Request, additionalContext: Record<string, any> = {}) => {
      const requestContext = getRequestContext(req);
      logger.http(message, { 
        ...context, 
        ...requestContext, 
        ...additionalContext 
      });
    }
  };
};

export default logger;