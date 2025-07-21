# WhatsApp Integration Resources

This document contains all the essential resources for implementing WhatsApp integration in the RSVP platform.

## 📚 Official Documentation

### Meta WhatsApp Business API
- **[Meta WhatsApp Cloud Setup Guide](https://developers.facebook.com/docs/whatsapp/cloud-api)** - Complete setup guide for WhatsApp Cloud API
- **[WhatsApp Business Platform Overview](https://developers.facebook.com/docs/whatsapp/overview)** - Platform overview and capabilities
- **[Getting Started with Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started)** - Quick start guide
- **[WhatsApp Business Account Setup](https://developers.facebook.com/docs/whatsapp/business-management-api/get-started)** - Business account configuration

### Twilio WhatsApp API
- **[WhatsApp Business Onboarding](https://www.twilio.com/docs/whatsapp/tutorial/connect-whatsapp-business)** - Complete Twilio WhatsApp setup
- **[Twilio WhatsApp API Documentation](https://www.twilio.com/docs/whatsapp/api)** - API reference and usage
- **[WhatsApp Templates](https://www.twilio.com/docs/whatsapp/tutorial/send-whatsapp-notification-messages-templates)** - Template message setup

### WhatsApp Web.js (Community Solution)
- **[WhatsApp Web.js GitHub Repository](https://github.com/pedroslopez/whatsapp-web.js)** - Primary repository
- **[Generate QR code for WhatsApp Web login](https://github.com/pedroslopez/whatsapp-web.js#example-with-authentication)** - QR code implementation
- **[WhatsApp Web.js Documentation](https://wwebjs.dev/)** - Complete documentation

## 📦 NPM Packages

### Official SDKs
- **[Node.js Business API SDK](https://www.npmjs.com/package/whatsapp-business-api)** - Official Node.js SDK
- **[Meta WhatsApp Business SDK](https://www.npmjs.com/package/@meta-platforms/whatsapp-business-api)** - Meta's official SDK
- **[Twilio Node.js SDK](https://www.npmjs.com/package/twilio)** - Twilio's official Node.js library

### Community Packages
- **[whatsapp-web.js](https://www.npmjs.com/package/whatsapp-web.js)** - WhatsApp Web automation
- **[@whiskeysockets/baileys](https://www.npmjs.com/package/@whiskeysockets/baileys)** - WhatsApp Web API library
- **[whatsapp-cloud-api](https://www.npmjs.com/package/whatsapp-cloud-api)** - Simplified Cloud API wrapper

## 🏗️ Implementation Architecture

### Provider Configuration
```typescript
export interface WhatsAppProvider {
  provider: 'meta' | 'twilio' | 'web'
  phoneNumberId: string
  accessToken: string
  webhookVerifyToken: string
  businessAccountId?: string
  appId?: string
  appSecret?: string
}
```

### Meta WhatsApp Cloud API Setup
1. **Facebook Developer Account**: Create account at [developers.facebook.com](https://developers.facebook.com)
2. **Create App**: Business app with WhatsApp product
3. **Add Phone Number**: Configure business phone number
4. **Generate Tokens**: Access tokens for API calls
5. **Webhook Setup**: Configure webhook endpoints
6. **Verify Webhook**: Implement verification endpoint

### Twilio WhatsApp Setup
1. **Twilio Account**: Sign up at [twilio.com](https://www.twilio.com)
2. **WhatsApp Sender**: Request WhatsApp-enabled number
3. **Template Approval**: Submit message templates
4. **API Keys**: Get Account SID and Auth Token
5. **Webhook URLs**: Configure status callbacks

### WhatsApp Web.js Setup
1. **QR Code Generation**: Display QR for phone scanning
2. **Session Management**: Handle session persistence
3. **Event Handling**: Listen for messages and status
4. **Rate Limiting**: Implement appropriate delays

## 🔧 Configuration Examples

### Meta WhatsApp Cloud API
```typescript
const metaConfig = {
  provider: 'meta',
  phoneNumberId: 'YOUR_PHONE_NUMBER_ID',
  accessToken: 'YOUR_ACCESS_TOKEN',
  webhookVerifyToken: 'YOUR_VERIFY_TOKEN',
  businessAccountId: 'YOUR_BUSINESS_ACCOUNT_ID',
  appId: 'YOUR_APP_ID',
  appSecret: 'YOUR_APP_SECRET'
}
```

### Twilio Configuration
```typescript
const twilioConfig = {
  provider: 'twilio',
  phoneNumberId: 'whatsapp:+1234567890',
  accessToken: 'YOUR_AUTH_TOKEN',
  webhookVerifyToken: 'YOUR_WEBHOOK_TOKEN',
  accountSid: 'YOUR_ACCOUNT_SID'
}
```

### WhatsApp Web.js Configuration
```typescript
const webConfig = {
  provider: 'web',
  phoneNumberId: 'session_name',
  accessToken: 'not_required',
  webhookVerifyToken: 'local_webhook_token',
  sessionPath: './sessions/',
  headless: true
}
```

## 📋 Integration Checklist

### Pre-requisites
- [ ] Business phone number for WhatsApp
- [ ] Facebook Business Account (for Meta API)
- [ ] Verified domain for webhooks
- [ ] SSL certificate for webhook endpoints

### Meta WhatsApp Business API
- [ ] Create Facebook Developer account
- [ ] Create business app with WhatsApp product
- [ ] Add and verify business phone number
- [ ] Generate access token and webhook verify token
- [ ] Configure webhook URL in Facebook app
- [ ] Test webhook verification endpoint
- [ ] Submit app for review (if needed)

### Twilio WhatsApp API
- [ ] Create Twilio account
- [ ] Request WhatsApp-enabled phone number
- [ ] Create and submit message templates
- [ ] Configure webhook URLs for status updates
- [ ] Test API with sandbox environment
- [ ] Go live with approved templates

### WhatsApp Web.js
- [ ] Install whatsapp-web.js package
- [ ] Set up QR code generation endpoint
- [ ] Implement session persistence
- [ ] Configure message event handlers
- [ ] Set up proper error handling
- [ ] Implement rate limiting

## 🔗 Webhook Implementation

### Meta WhatsApp Webhook
```typescript
app.post('/webhook/whatsapp/meta', (req, res) => {
  const { body } = req
  
  if (body.object === 'whatsapp_business_account') {
    body.entry?.forEach((entry: any) => {
      entry.changes?.forEach((change: any) => {
        if (change.field === 'messages') {
          // Handle incoming message
          const messages = change.value.messages
          // Process messages...
        }
      })
    })
    res.status(200).send('OK')
  }
})
```

### Webhook Verification
```typescript
app.get('/webhook/whatsapp/verify', (req, res) => {
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN
  const mode = req.query['hub.mode']
  const token = req.query['hub.verify_token']
  const challenge = req.query['hub.challenge']
  
  if (mode === 'subscribe' && token === verifyToken) {
    res.status(200).send(challenge)
  } else {
    res.status(403).send('Verification failed')
  }
})
```

## 📞 Message Templates

### RSVP Invitation Template
```json
{
  "name": "rsvp_invitation",
  "category": "MARKETING",
  "language": "en",
  "components": [
    {
      "type": "BODY",
      "text": "Hello {{1}}, you're invited to {{2}}'s wedding! Please RSVP by clicking: {{3}}"
    },
    {
      "type": "FOOTER",
      "text": "Reply STOP to unsubscribe"
    }
  ]
}
```

### RSVP Reminder Template
```json
{
  "name": "rsvp_reminder",
  "category": "UTILITY",
  "language": "en",
  "components": [
    {
      "type": "BODY",
      "text": "Hi {{1}}, gentle reminder to RSVP for {{2}}'s wedding by {{3}}. Link: {{4}}"
    }
  ]
}
```

## 🔒 Security Considerations

### Token Management
- Store access tokens securely (environment variables)
- Implement token refresh logic for long-lived tokens
- Use webhook verification tokens
- Validate all incoming webhook requests

### Rate Limiting
- Meta: 1000 messages per second
- Twilio: Varies by account type
- WhatsApp Web.js: Manual rate limiting required

### Compliance
- Follow WhatsApp Business Policy
- Obtain user consent before messaging
- Provide easy opt-out mechanisms
- Respect messaging windows (24-hour rule)

## 🧪 Testing

### Meta WhatsApp Testing
- Use test phone numbers in development
- Test webhook endpoints with ngrok
- Validate message templates in sandbox
- Monitor message delivery status

### Twilio Testing
- Use Twilio WhatsApp Sandbox
- Test with approved templates only
- Monitor delivery status via webhooks
- Use Twilio Console for debugging

### WhatsApp Web.js Testing
- Test QR code generation and scanning
- Verify session persistence
- Test message sending and receiving
- Monitor for WhatsApp Web blocks

## 📊 Monitoring & Analytics

### Key Metrics
- Message delivery rates
- Template approval status
- API response times
- Webhook success rates
- User engagement rates

### Error Handling
- Failed message delivery
- Webhook timeout errors
- Rate limit exceeded
- Template rejection
- Session expiration (Web.js)

## 🔄 Migration Strategy

### From WhatsApp Web.js to Business API
1. Maintain parallel systems during transition
2. Migrate templates to Business API format
3. Update webhook endpoints
4. Test thoroughly before switching
5. Notify users of any changes required

### Backup Plans
- Multiple provider support
- Fallback to email notifications
- Manual message sending capabilities
- Session backup and restore (Web.js)