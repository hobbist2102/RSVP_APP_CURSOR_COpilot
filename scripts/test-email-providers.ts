
import { EmailService } from '../server/services/email';
import { storage } from '../server/storage';

async function testEmailProviders(eventId: number) {
  try {
    const event = await storage.getEvent(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    const emailService = EmailService.fromEvent(event);
    
    // Test email sending
    const testResult = await emailService.sendEmail({
      to: 'test@example.com',
      subject: 'Test Email Configuration',
      html: '<p>This is a test email to verify the email provider configuration.</p>',
      text: 'This is a test email to verify the email provider configuration.'
    });

    console.log('Email test result:', testResult);
    
    if (testResult.success) {
      console.log('✅ Email configuration test passed');
    } else {
      console.error('❌ Email configuration test failed:', testResult.error);
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Usage: ts-node scripts/test-email-providers.ts <eventId>
const eventId = parseInt(process.argv[2]);
if (isNaN(eventId)) {
  console.error('Please provide an event ID');
  process.exit(1);
}

testEmailProviders(eventId);
