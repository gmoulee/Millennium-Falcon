import { Express } from 'express'
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Millennium Falcon API',
      version: '1.0.0',
      description: 'Backend service for computing optimal routes for the Millennium Falcon',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        ComputeRequest: {
          type: 'object',
          required: ['arrival'],
          properties: {
            arrival: {
              type: 'string',
              description: 'Destination planet name',
              example: 'Endor',
            },
          },
        },
        ComputeResponse: {
          type: 'object',
          properties: {
            duration: {
              type: 'number',
              description: 'Total travel time in days',
              example: 8,
            },
            route: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Array of planets in the optimal route',
              example: ['Tatooine', 'Hoth', 'Endor'],
            },
          },
        },
        HealthCheckResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['healthy', 'unhealthy'],
              description: 'Service health status',
              example: 'healthy',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'ISO timestamp of the health check',
              example: '2024-01-15T10:30:00.000Z',
            },
            uptime: {
              type: 'number',
              description: 'Service uptime in seconds',
              example: 3600,
            },
            version: {
              type: 'string',
              description: 'Application version',
              example: '1.0.0',
            },
            environment: {
              type: 'string',
              description: 'Environment name',
              example: 'development',
            },
            memory: {
              type: 'object',
              properties: {
                used: {
                  type: 'number',
                  description: 'Used memory in bytes',
                  example: 52428800,
                },
                total: {
                  type: 'number',
                  description: 'Total memory in bytes',
                  example: 104857600,
                },
                percentage: {
                  type: 'number',
                  description: 'Memory usage percentage',
                  example: 50,
                },
              },
            },
            ip: {
              type: 'string',
              description: 'Client IP address',
              example: '127.0.0.1',
            },
            userAgent: {
              type: 'string',
              description: 'Client user agent',
              example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
          },
        },
        ReadinessCheckResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['ready', 'not ready'],
              description: 'Service readiness status',
              example: 'ready',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'ISO timestamp of the readiness check',
              example: '2024-01-15T10:30:00.000Z',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  description: 'Error message',
                  example: 'Invalid request body',
                },
              },
            },
          },
        },
        ValidationError: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  description: 'Validation error message',
                  example: 'Missing required field: arrival',
                },
                details: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      field: {
                        type: 'string',
                        example: 'arrival',
                      },
                      message: {
                        type: 'string',
                        example: 'is required',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      responses: {
        BadRequest: {
          description: 'Bad Request - Invalid input',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ValidationError',
              },
            },
          },
        },
        NotFound: {
          description: 'Not Found - No route found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              example: {
                error: {
                  message: 'No route found from Tatooine to UnknownPlanet',
                },
              },
            },
          },
        },
        InternalServerError: {
          description: 'Internal Server Error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              example: {
                error: {
                  message: 'An unexpected error occurred',
                },
              },
            },
          },
        },
        ServiceUnavailable: {
          description: 'Service Unavailable - Service not ready',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              example: {
                error: {
                  message: 'Service not ready',
                },
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Health',
        description: 'Health and readiness check endpoints',
      },
      {
        name: 'Routes',
        description: 'Route computation endpoints',
      },
    ],
  },
  apis: ['./src/docs/*.ts'], // Path to the API documentation files
}

const specs = swaggerJsdoc(options)

export const setupSwagger = (app: Express): void => {
  // Swagger UI
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(specs, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Millennium Falcon API Documentation',
    })
  )

  // JSON endpoint for the OpenAPI spec
  app.get('/api-docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json')
    res.send(specs)
  })
}

export default specs
