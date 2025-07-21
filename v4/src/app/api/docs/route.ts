import { NextRequest, NextResponse } from 'next/server'

// OpenAPI 3.0 specification for Wedding RSVP Platform API
const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Wedding RSVP Platform API',
    version: '4.0.0',
    description: 'Comprehensive API for wedding RSVP and guest management platform with real-time features, multi-provider communication, and advanced analytics.',
    contact: {
      name: 'Wedding RSVP Platform',
      email: 'support@weddingplatform.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      description: 'Production server'
    },
    {
      url: 'http://localhost:3000',
      description: 'Development server'
    }
  ],
  paths: {
    // Authentication endpoints
    '/api/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'User login',
        description: 'Authenticate user and return JWT token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 6 }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        token: { type: 'string' },
                        user: { $ref: '#/components/schemas/User' }
                      }
                    }
                  }
                }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          400: { $ref: '#/components/responses/BadRequest' }
        }
      }
    },

    // Events endpoints
    '/api/events': {
      get: {
        tags: ['Events'],
        summary: 'Get all events',
        description: 'Retrieve all wedding events for authenticated user',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', minimum: 1, default: 1 }
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 }
          }
        ],
        responses: {
          200: {
            description: 'Events retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Event' }
                    },
                    pagination: { $ref: '#/components/schemas/Pagination' }
                  }
                }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' }
        }
      },
      post: {
        tags: ['Events'],
        summary: 'Create new event',
        description: 'Create a new wedding event',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateEventRequest' }
            }
          }
        },
        responses: {
          201: {
            description: 'Event created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/Event' }
                  }
                }
              }
            }
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' }
        }
      }
    },

    // Guests endpoints
    '/api/guests': {
      get: {
        tags: ['Guests'],
        summary: 'Get guests',
        description: 'Retrieve guests for an event with filtering and pagination',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'eventId',
            in: 'query',
            required: true,
            schema: { type: 'integer' }
          },
          {
            name: 'search',
            in: 'query',
            schema: { type: 'string' }
          },
          {
            name: 'rsvpStatus',
            in: 'query',
            schema: { type: 'string', enum: ['pending', 'confirmed', 'declined'] }
          },
          {
            name: 'side',
            in: 'query',
            schema: { type: 'string', enum: ['bride', 'groom'] }
          }
        ],
        responses: {
          200: {
            description: 'Guests retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Guest' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Guests'],
        summary: 'Create guest',
        description: 'Add a new guest to an event',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateGuestRequest' }
            }
          }
        },
        responses: {
          201: {
            description: 'Guest created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/Guest' }
                  }
                }
              }
            }
          }
        }
      }
    },

    // RSVP endpoints
    '/api/rsvp/submit': {
      post: {
        tags: ['RSVP'],
        summary: 'Submit RSVP',
        description: 'Submit RSVP response for a guest',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RSVPSubmission' }
            }
          }
        },
        responses: {
          200: {
            description: 'RSVP submitted successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' }
                  }
                }
              }
            }
          },
          400: { $ref: '#/components/responses/BadRequest' }
        }
      }
    },

    // Communication endpoints
    '/api/communication/email': {
      post: {
        tags: ['Communication'],
        summary: 'Send email',
        description: 'Send email to guests with multi-provider support',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/EmailRequest' }
            }
          }
        },
        responses: {
          200: {
            description: 'Email sent successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        messageId: { type: 'string' },
                        provider: { type: 'string' },
                        status: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },

    // Accommodation endpoints
    '/api/accommodation/hotels': {
      get: {
        tags: ['Accommodation'],
        summary: 'Get hotels',
        description: 'Retrieve hotels for an event',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'eventId',
            in: 'query',
            required: true,
            schema: { type: 'integer' }
          }
        ],
        responses: {
          200: {
            description: 'Hotels retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Hotel' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },

    // Analytics endpoints
    '/api/analytics/advanced': {
      get: {
        tags: ['Analytics'],
        summary: 'Get advanced analytics',
        description: 'Retrieve comprehensive analytics data for an event',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'eventId',
            in: 'query',
            required: true,
            schema: { type: 'integer' }
          },
          {
            name: 'timeRange',
            in: 'query',
            schema: { type: 'string', enum: ['24h', '7d', '30d', '90d', 'all'], default: '7d' }
          }
        ],
        responses: {
          200: {
            description: 'Analytics data retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/AnalyticsData' }
                  }
                }
              }
            }
          }
        }
      }
    }
  },

  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },

    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          username: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          role: { type: 'string', enum: ['admin', 'staff', 'couple'] },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },

      Event: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          title: { type: 'string' },
          coupleNames: { type: 'string' },
          brideName: { type: 'string' },
          groomName: { type: 'string' },
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
          location: { type: 'string' },
          description: { type: 'string' },
          rsvpDeadline: { type: 'string', format: 'date' },
          allowPlusOnes: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },

      Guest: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          eventId: { type: 'integer' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          side: { type: 'string', enum: ['bride', 'groom'] },
          rsvpStatus: { type: 'string', enum: ['pending', 'confirmed', 'declined'] },
          rsvpToken: { type: 'string' },
          allowedPlusOnes: { type: 'integer' },
          confirmedPlusOnes: { type: 'integer' },
          children: { type: 'array', items: { $ref: '#/components/schemas/Child' } },
          dietaryRestrictions: { type: 'string' },
          needsAccommodation: { type: 'boolean' },
          flightAssistance: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },

      Child: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'integer' },
          dietaryRestrictions: { type: 'string' }
        }
      },

      Hotel: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          eventId: { type: 'integer' },
          name: { type: 'string' },
          address: { type: 'string' },
          phone: { type: 'string' },
          website: { type: 'string', format: 'uri' },
          description: { type: 'string' },
          isDefault: { type: 'boolean' },
          priceRange: { type: 'string' },
          distanceFromVenue: { type: 'string' },
          amenities: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },

      AnalyticsData: {
        type: 'object',
        properties: {
          rsvpStats: {
            type: 'object',
            properties: {
              total: { type: 'integer' },
              confirmed: { type: 'integer' },
              pending: { type: 'integer' },
              declined: { type: 'integer' },
              confirmationRate: { type: 'number' },
              dailyResponses: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    date: { type: 'string', format: 'date' },
                    count: { type: 'integer' }
                  }
                }
              }
            }
          },
          communicationStats: {
            type: 'object',
            properties: {
              emailsSent: { type: 'integer' },
              emailsOpened: { type: 'integer' },
              emailsClicked: { type: 'integer' },
              whatsappSent: { type: 'integer' },
              whatsappDelivered: { type: 'integer' },
              openRate: { type: 'number' },
              clickRate: { type: 'number' },
              deliveryRate: { type: 'number' }
            }
          }
        }
      },

      CreateEventRequest: {
        type: 'object',
        required: ['title', 'coupleNames', 'brideName', 'groomName', 'startDate', 'endDate', 'location'],
        properties: {
          title: { type: 'string', minLength: 1 },
          coupleNames: { type: 'string', minLength: 1 },
          brideName: { type: 'string', minLength: 1 },
          groomName: { type: 'string', minLength: 1 },
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
          location: { type: 'string', minLength: 1 },
          description: { type: 'string' },
          rsvpDeadline: { type: 'string', format: 'date' },
          allowPlusOnes: { type: 'boolean', default: true }
        }
      },

      CreateGuestRequest: {
        type: 'object',
        required: ['eventId', 'firstName', 'lastName', 'side'],
        properties: {
          eventId: { type: 'integer' },
          firstName: { type: 'string', minLength: 1 },
          lastName: { type: 'string', minLength: 1 },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          side: { type: 'string', enum: ['bride', 'groom'] },
          allowedPlusOnes: { type: 'integer', minimum: 0, default: 0 },
          dietaryRestrictions: { type: 'string' },
          needsAccommodation: { type: 'boolean', default: false },
          flightAssistance: { type: 'boolean', default: false }
        }
      },

      RSVPSubmission: {
        type: 'object',
        required: ['token', 'rsvpStatus'],
        properties: {
          token: { type: 'string' },
          rsvpStatus: { type: 'string', enum: ['confirmed', 'declined'] },
          plusOneNames: {
            type: 'array',
            items: { type: 'string' }
          },
          children: {
            type: 'array',
            items: { $ref: '#/components/schemas/Child' }
          },
          ceremonyAttendance: {
            type: 'object',
            additionalProperties: { type: 'boolean' }
          },
          mealSelections: {
            type: 'object',
            additionalProperties: { type: 'integer' }
          },
          dietaryRestrictions: { type: 'string' },
          specialRequests: { type: 'string' }
        }
      },

      EmailRequest: {
        type: 'object',
        required: ['action'],
        properties: {
          action: { type: 'string', enum: ['send-single', 'send-bulk', 'preview'] },
          eventId: { type: 'integer' },
          templateId: { type: 'integer' },
          recipients: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                email: { type: 'string', format: 'email' },
                guestId: { type: 'integer' }
              }
            }
          },
          subject: { type: 'string' },
          content: { type: 'string' },
          isHtml: { type: 'boolean', default: true }
        }
      },

      Pagination: {
        type: 'object',
        properties: {
          page: { type: 'integer' },
          limit: { type: 'integer' },
          total: { type: 'integer' },
          pages: { type: 'integer' }
        }
      },

      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', enum: [false] },
          error: { type: 'string' },
          code: { type: 'string' },
          details: { type: 'array', items: { type: 'object' } }
        }
      }
    },

    responses: {
      BadRequest: {
        description: 'Bad request - validation failed',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' }
          }
        }
      },
      Unauthorized: {
        description: 'Unauthorized - invalid or missing authentication',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' }
          }
        }
      },
      NotFound: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' }
          }
        }
      },
      InternalServerError: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' }
          }
        }
      }
    }
  },

  tags: [
    {
      name: 'Authentication',
      description: 'User authentication and authorization'
    },
    {
      name: 'Events',
      description: 'Wedding event management'
    },
    {
      name: 'Guests',
      description: 'Guest management and CRUD operations'
    },
    {
      name: 'RSVP',
      description: 'RSVP submission and management'
    },
    {
      name: 'Communication',
      description: 'Email and WhatsApp communication'
    },
    {
      name: 'Accommodation',
      description: 'Hotel and room management'
    },
    {
      name: 'Analytics',
      description: 'Real-time analytics and reporting'
    }
  ]
}

// GET /api/docs - Return OpenAPI specification
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const format = searchParams.get('format') || 'json'

  if (format === 'yaml') {
    // Convert to YAML if requested
    const yaml = JSON.stringify(openApiSpec, null, 2)
    return new NextResponse(yaml, {
      headers: {
        'Content-Type': 'application/x-yaml',
        'Content-Disposition': 'attachment; filename="api-docs.yaml"'
      }
    })
  }

  return NextResponse.json(openApiSpec, {
    headers: {
      'Content-Type': 'application/json'
    }
  })
}