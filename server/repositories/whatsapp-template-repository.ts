import { TenantRepository } from '../lib/tenant-repository';
import { whatsappTemplates, WhatsappTemplate, InsertWhatsappTemplate } from '@shared/schema';
import { eq, and, SQL, like, desc } from 'drizzle-orm';
import { db } from '../db';
import { withTenantFilter } from '../lib/query-builder';

/**
 * WhatsappTemplateRepository provides data access for WhatsApp template entities with tenant isolation
 */
export class WhatsappTemplateRepository extends TenantRepository<WhatsappTemplate, InsertWhatsappTemplate> {
  constructor() {
    super(whatsappTemplates);
  }
  
  /**
   * Get templates by category
   * @param category The category to filter by
   * @param eventId The event ID (tenant)
   * @returns Templates in the specified category
   */
  async getTemplatesByCategory(category: string, eventId: number): Promise<WhatsappTemplate[]> {
    try {
      const condition = withTenantFilter(
        whatsappTemplates,
        'eventId' as keyof WhatsappTemplate,
        eventId,
        eq(whatsappTemplates.category, category)
      );
      
      const result = await db.select()
        .from(whatsappTemplates)
        .where(condition)
        .orderBy(desc(whatsappTemplates.createdAt));
        
      return result;
    } catch (error) {
      console.error(`Failed to get WhatsApp templates for category ${category} in event ${eventId}:`, error);
      throw error;
    }
  }
  
  /**
   * Search for templates by name
   * @param searchTerm The search term
   * @param eventId The event ID (tenant)
   * @returns Matching templates
   */
  async searchTemplates(searchTerm: string, eventId: number): Promise<WhatsappTemplate[]> {
    try {
      const term = `%${searchTerm}%`;
      
      const condition = withTenantFilter(
        whatsappTemplates,
        'eventId' as keyof WhatsappTemplate,
        eventId,
        like(whatsappTemplates.name, term)
      );
      
      const result = await db.select()
        .from(whatsappTemplates)
        .where(condition)
        .orderBy(desc(whatsappTemplates.lastUsed));
        
      return result;
    } catch (error) {
      console.error(`Failed to search WhatsApp templates with term "${searchTerm}" in event ${eventId}:`, error);
      throw error;
    }
  }
  
  /**
   * Update the last used timestamp for a template
   * @param id The template ID
   * @param eventId The event ID (tenant)
   * @returns true if updated, false if not found
   */
  async updateLastUsed(id: number, eventId: number): Promise<boolean> {
    try {
      const condition = withTenantFilter(
        whatsappTemplates,
        'eventId' as keyof WhatsappTemplate,
        eventId,
        eq(whatsappTemplates.id, id)
      );
      
      const result = await db.update(whatsappTemplates)
        .set({ lastUsed: new Date() })
        .where(condition)
        .returning();
        
      return result.length > 0;
    } catch (error) {
      console.error(`Failed to update last used timestamp for WhatsApp template ${id} in event ${eventId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get recently used templates
   * @param eventId The event ID (tenant)
   * @param limit Maximum number of templates to return
   * @returns Recently used templates
   */
  async getRecentlyUsedTemplates(eventId: number, limit: number = 5): Promise<WhatsappTemplate[]> {
    try {
      const condition = withTenantFilter(
        whatsappTemplates,
        'eventId' as keyof WhatsappTemplate,
        eventId
      );
      
      const result = await db.select()
        .from(whatsappTemplates)
        .where(condition)
        .orderBy(desc(whatsappTemplates.lastUsed))
        .limit(limit);
        
      return result;
    } catch (error) {
      console.error(`Failed to get recently used WhatsApp templates for event ${eventId}:`, error);
      throw error;
    }
  }
}