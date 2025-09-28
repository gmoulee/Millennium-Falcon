import compression from 'compression'
import cors from 'cors'
import express, { Application } from 'express'
import helmet from 'helmet'
import morgan from 'morgan'

import { createHealthRouter } from './routes/healthRouter'
import { createRouteRouter } from './routes/routeRouter'
import { requestLogger } from './utils/logger'
import { errorHandler, notFoundHandler } from './utils/middleware'
import { setupSwagger } from './utils/swagger'

// Request body size limits
const REQUEST_LIMITS = {
  // JSON payloads should be small for this API (route computation requests)
  JSON: '1mb',
  // URL-encoded forms (if needed for file uploads, etc.)
  URL_ENCODED: '5mb',
} as const

export const createApp = (): Application => {
  const app = express()

  // Security middleware
  app.use(helmet())

  // CORS configuration
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true)

        const allowedOrigins = process.env['ALLOWED_ORIGINS']?.split(',') || [
          'http://localhost:3001',
          'http://127.0.0.1:3001',
        ]

        if (allowedOrigins.includes(origin)) {
          callback(null, true)
        } else {
          callback(new Error('Not allowed by CORS'))
        }
      },
      credentials: true,
    })
  )

  // Compression middleware
  app.use(compression())

  // Logging middleware
  app.use(morgan(process.env['NODE_ENV'] === 'production' ? 'combined' : 'dev'))
  app.use(requestLogger)

  // Body parsing middleware
  app.use(express.json({ limit: REQUEST_LIMITS.JSON }))
  app.use(express.urlencoded({ extended: true, limit: REQUEST_LIMITS.URL_ENCODED }))

  // API Documentation
  setupSwagger(app)

  // Health check endpoints
  app.use(createHealthRouter())

  // Route handlers
  app.use(createRouteRouter())

  // Error handling middleware (must be last)
  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
