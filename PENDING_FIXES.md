# Pending Fixes and Tasks

## High Priority

### 1. Event Wizard Form Fixes
- [x] Add missing `useEffect` hook to handle existing event data initialization
- [ ] Fix TypeScript typing issues in form schemas and field definitions
- [ ] Implement proper form field validation for all steps
- [ ] Test editing functionality for all form sections
- [ ] Ensure proper state updates when navigating between wizard steps

### 2. OAuth Configuration and Implementation
- [ ] Create centralized OAuth configuration UI for all providers
- [ ] Implement token refresh logic for Gmail and Outlook
- [ ] Store OAuth tokens securely with encryption
- [ ] Make OAuth configurations event-specific rather than global
- [ ] Add proper error handling for failed authentication attempts
- [ ] Implement provider-specific connection testing

### 3. RSVP Follow-up Communication System
- [ ] Create template selection UI for different RSVP statuses
- [ ] Implement logic to determine appropriate follow-up template
- [ ] Add scheduling functionality for delayed communications
- [ ] Connect email providers to the communication system
- [ ] Add WhatsApp message templates (if WhatsApp integration is ready)
- [ ] Implement preview functionality for templates

## Medium Priority

### 4. Database Schema Fixes
- [ ] Add missing columns to the `accommodations` table
- [ ] Fix type inconsistencies between schema definition and usage
- [ ] Update database migration scripts
- [ ] Add proper index definitions for performance optimization
- [ ] Add foreign key constraints for data integrity
- [ ] Implement proper cascade delete behavior

### 5. Guest Management Enhancements
- [ ] Enhance guest list filtering and sorting functionality
- [ ] Complete Excel import/export functionality with validation
- [ ] Add bulk operations for guest management
- [ ] Implement guest relationship tracking
- [ ] Add guest categorization enhancement (beyond bride/groom side)
- [ ] Implement guest notes and special requirements tracking

### 6. Accommodation System Completion
- [ ] Fix hotel-room-guest relationship management
- [ ] Add check-in/check-out tracking functionality
- [ ] Implement room allocation visualization
- [ ] Add special requests handling for accommodations
- [ ] Implement room sharing logic for families/groups
- [ ] Create room type management with pricing

### 7. Travel Logistics Enhancement
- [ ] Complete travel detail collection in RSVP forms
- [ ] Add transportation arrangement tracking
- [ ] Implement travel schedule visualization
- [ ] Add airport pickup coordination
- [ ] Create shuttle service scheduling
- [ ] Implement maps integration for venues and hotels

## Lower Priority

### 8. WhatsApp Integration
- [ ] Research WhatsApp Business API requirements
- [ ] Implement WhatsApp Business API connection
- [ ] Add template messaging support
- [ ] Connect to RSVP notification system
- [ ] Add message tracking and status reporting
- [ ] Implement automated responses to common questions

### 9. User Interface Improvements
- [ ] Improve overall design consistency
- [ ] Add more visual components (dashboards, charts)
- [ ] Optimize mobile experience
- [ ] Enhance form accessibility
- [ ] Add dark mode support
- [ ] Implement guest-facing RSVP form customization

### 10. Reporting and Analytics
- [ ] Create attendance reports
- [ ] Generate accommodation reports
- [ ] Implement expense tracking
- [ ] Add guest demographic visualization
- [ ] Create event timeline visualization
- [ ] Implement export functionality for all reports

## Technical Debt Items

### 11. Code Optimization
- [ ] Refactor event wizard form implementation
- [ ] Optimize database queries for guest list performance
- [ ] Implement proper error handling throughout the application
- [ ] Add comprehensive logging for debugging
- [ ] Improve component reusability
- [ ] Implement proper TypeScript typing throughout the codebase

### 12. Testing
- [ ] Add unit tests for critical components
- [ ] Implement integration tests for workflow validation
- [ ] Create end-to-end tests for RSVP process
- [ ] Add performance testing for large guest lists
- [ ] Implement security testing for authentication and authorization
- [ ] Add automated regression testing