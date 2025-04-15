# Wedding Management Platform Documentation

Welcome to the documentation for the Indian Wedding Management Platform. This directory contains detailed documentation on various aspects of the platform's architecture, features, and technical implementation.

## Available Documentation

### [Multi-Tenant Data Isolation](MULTI_TENANT_ISOLATION.md)
Detailed explanation of how the platform implements data isolation between different wedding events, ensuring data security and privacy across multiple concurrent wedding projects.

### [OAuth Implementation](OAUTH_IMPLEMENTATION.md)
Documentation for the OAuth integration with Gmail and Outlook, including event-specific credential storage, fallback mechanisms, and UI configuration guidance.

## Coming Soon

- **WhatsApp Integration**: Technical details on the WhatsApp Business API integration
- **Guest Management**: Comprehensive documentation on guest data management and RSVP tracking
- **Template System**: Information on the template system for communications
- **Security Overview**: Comprehensive security measures implemented in the platform

## Developer Guides

When contributing to the platform, please follow these guidelines:

1. **Event Context Awareness**: Always implement event context validation for database access
2. **OAuth Token Handling**: Follow secure practices for handling OAuth tokens and credentials
3. **Error Handling**: Implement comprehensive error handling with user-friendly messages
4. **Documentation**: Update relevant documentation when implementing new features

For more information, refer to the main [README.md](../README.md) in the project root.