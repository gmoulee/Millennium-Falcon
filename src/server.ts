import dotenv from 'dotenv'

import { createApp } from './app'
import { MillenniumFalconConfig } from './types/routeTypes'
import { initializeConfig, loadConfig } from './utils/config'
import { logger } from './utils/logger'
import { validateDeparture } from './utils/middleware'
import { loadRoutes } from './utils/routeCache'

// Load environment variables
dotenv.config()

const PORT = process.env['PORT'] || 3001
const CONFIG_PATH = process.env['CONFIG_PATH'] || './config/millennium-falcon.json'

const startServer = async (): Promise<void> => {
  try {
    // Load configuration
    const config: MillenniumFalconConfig = loadConfig(CONFIG_PATH)

    logger.info(
      {
        autonomy: config.autonomy,
        departure: config.departure,
        routesDb: config.routesDb,
      },
      'Millennium Falcon Configuration'
    )

    // Initialize config at startup
    initializeConfig(config)
    logger.info('Config initialized at startup')

    // Initialize route cache at startup
    await loadRoutes(config)
    logger.info('Route cache initialized at startup')

    // Validate departure planet using loaded routes
    validateDeparture(config.departure)

    // Create Express app with all configuration
    const app = createApp()

    // Start server
    const server = app.listen(PORT, () => {
      logger.info(
        {
          port: PORT,
          environment: process.env['NODE_ENV'] || 'development',
          healthEndpoint: `http://localhost:${PORT}/health`,
          computeEndpoint: `http://localhost:${PORT}/compute`,
        },
        'Millennium Falcon backend server started'
      )
    })

    // Graceful shutdown
    const gracefulShutdown = (signal: string): void => {
      logger.info(`Received ${signal}, shutting down gracefully`)
      server.close(() => {
        logger.info('Server closed')
        process.exit(0)
      })
    }

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
    process.on('SIGINT', () => gracefulShutdown('SIGINT'))
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error({ error: errorMessage }, 'Failed to start server')
    process.exit(1)
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', error => {
  logger.error({ error: error.message, stack: error.stack }, 'Uncaught Exception')
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  logger.error({ reason, promise }, 'Unhandled Rejection')
  process.exit(1)
})

void startServer()
