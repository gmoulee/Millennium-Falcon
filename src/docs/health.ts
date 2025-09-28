/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the current health status of the service including uptime, memory usage, and system information
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheckResponse'
 *             example:
 *               status: "healthy"
 *               timestamp: "2024-01-15T10:30:00.000Z"
 *               uptime: 3600
 *               version: "1.0.0"
 *               environment: "development"
 *               memory:
 *                 used: 52428800
 *                 total: 104857600
 *                 percentage: 50
 *               ip: "127.0.0.1"
 *               userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
 *       500:
 *         description: Service is unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "unhealthy"
 *               timestamp: "2024-01-15T10:30:00.000Z"
 *               error: "Health check failed"
 */

/**
 * @swagger
 * /ready:
 *   get:
 *     summary: Readiness check endpoint
 *     description: Returns the readiness status of the service, indicating if it's ready to accept requests
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is ready
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReadinessCheckResponse'
 *             example:
 *               status: "ready"
 *               timestamp: "2024-01-15T10:30:00.000Z"
 *       503:
 *         description: Service is not ready
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "not ready"
 *               timestamp: "2024-01-15T10:30:00.000Z"
 *               error: "Service not ready"
 */

// This file contains Swagger/OpenAPI documentation for health endpoints
// The JSDoc comments above are parsed by swagger-jsdoc to generate API documentation
export const healthDocs = 'Health endpoint documentation'
