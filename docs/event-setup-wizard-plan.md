# Event Setup Wizard Implementation Plan

## Current State Analysis

The Wedding RSVP system currently has these setup areas spread across different pages:

1. **Event Settings** - Basic event information, dates, couple details
2. **Hotels & Accommodations** - Hotel properties and room inventory management
3. **Transport Groups** - Vehicle types and transportation arrangements
4. **RSVP Configuration** - RSVP form settings and deadline management
5. **Email Templates** - Communication templates and design
6. **Email Configuration** - SMTP/OAuth settings for email delivery

## Centralized Wizard Concept

The proposed Event Setup Wizard will unify these areas into a guided, step-by-step process while maintaining the ability to:
- Skip any section and return later
- Save progress at any point
- Complete setup sections out of sequence if needed

## Wizard Flow & Sections

### 1. Basic Event Information
- Event title
- Couple names
- Event type
- Start/end dates
- Location
- Description
- Banner images

### 2. Venues & Ceremonies 
- Add multiple venues
- Ceremony details and times
- Map links
- Venue photos
- Attire code per ceremony

### 3. RSVP Configuration
- RSVP form customization
- Response deadline
- Meal preferences (if applicable)
- Question customization
- Travel information requirements

### 4. Hotels & Accommodation
- Create hotel properties
- Room types and inventory per hotel
- Room capacities and bed configurations
- Pricing (if applicable)
- Amenities and special features
- Hotel/room images
- Contact information

### 5. Transportation Options
- Define vehicle types
- Vehicle capacities
- Driver information requirements
- Transport provider contacts
- Special accommodation options

### 6. Email & Communication Setup
- Select/customize email templates
- Define sender information
- Configure email providers (Gmail/Outlook/SMTP)
- OAuth authorization
- Test email delivery

### 7. Design & Styling
- Color schemes
- Typography
- Banner images
- Brand elements
- Photo uploads

## Implementation Approach

### Phase 1: Wizard Framework
1. Create wizard UI framework
2. Implement step navigation
3. Develop progress tracking
4. Build saving/resuming functionality

### Phase 2: Data Integration
1. Connect existing data models to wizard
2. Ensure data consistency between wizard and individual pages
3. Develop data validation for each step
4. Create comprehensive event status tracking

### Phase 3: Refactoring Existing Features
1. Modify hotel management to reference wizard data
2. Adapt accommodation system to use wizard-defined inventory
3. Refactor transport module to utilize predefined transport options
4. Update RSVP module to reference wizard configuration
5. Connect email system to wizard-defined templates and settings

### Phase 4: UI/UX Streamlining
1. Replace redundant setup pages with wizard links
2. Add quick-edit options from management pages
3. Improve navigation between wizard and management interfaces
4. Add dashboard indicators for incomplete setup sections

## Required Changes to Transport Module

Current transport implementation requires significant changes:

1. **Transport Options Definition:**
   - Move from creating individual transport groups to defining available fleet
   - Predefine vehicle types, capacities, and counts during setup
   - Set default pickup/dropoff locations

2. **Guest Allocation Logic:**
   - Maintain family grouping logic
   - Match guests to appropriate predefined vehicles based on:
     - Family size
     - Arrival times
     - Special requirements
   - Present matches as drafts for approval

3. **UI Changes:**
   - Replace "Transport Groups" page with "Transport Assignments"
   - Show available fleet with allocation status
   - Allow manual adjustments to auto-generated assignments
   - Maintain family cohesion in UI presentation

## Data Model Updates

Several schema updates will be required:

1. **New Tables:**
   - `event_setup_progress` - Track completion status of wizard sections
   - `transport_fleet` - Define available vehicle types and counts
   - `transport_options` - Store predefined transport templates

2. **Modifications:**
   - Update `transport_groups` to reference fleet vehicles
   - Add progress tracking fields to `events` table
   - Link accommodation types to wizard-defined templates

## Migration Strategy

To preserve existing data while implementing the wizard:

1. Create migration scripts for each module
2. Populate wizard defaults from existing configurations
3. Update references in existing data to new wizard-defined options
4. Provide UI indicators for items needing review after migration

## Timeline Estimate

| Phase | Description | Estimated Time |
|-------|-------------|----------------|
| 1 | Wizard Framework | 1-2 weeks |
| 2 | Data Integration | 1-2 weeks |
| 3 | Feature Refactoring | 2-3 weeks |
| 4 | UI/UX Streamlining | 1 week |
| | **Total** | **5-8 weeks** |

## Success Criteria

The wizard implementation will be considered successful when:

1. All setup functions are accessible through the wizard
2. Existing data is preserved and properly connected
3. Users can navigate seamlessly between wizard and management interfaces
4. Setup process requires fewer clicks and less context switching
5. Management functions properly utilize wizard-defined parameters