import dotenv from 'dotenv'
import { createApp } from './app'
import { MillenniumFalconConfig } from './types/routeTypes'
import { initializeConfig, loadConfig } from './utils/config'
import { logger } from './utils/logger'
import { validateDeparture } from './utils/middleware'
import { loadRoutes } from './utils/routeCache'

// Load environment variables
dotenv.config()

const PORT = process.env['PORT'] || 3000
const CONFIG_PATH = process.env['CONFIG_PATH'] || './config/millennium-falcon.json'

const startServer = async (): Promise<void> => {
  try {
    // Load configuration
    const config: MillenniumFalconConfig = loadConfig(CONFIG_PATH)

    logger.info('Millennium Falcon Configuration', {
      autonomy: config.autonomy,
      departure: config.departure,
      routesDb: config.routesDb,
    })

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
      logger.info('Millennium Falcon backend server started', {
        port: PORT,
        environment: process.env['NODE_ENV'] || 'development',
        healthEndpoint: `http://localhost:${PORT}/health`,
        computeEndpoint: `http://localhost:${PORT}/compute`,
      })
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
    logger.error('Failed to start server', { error: errorMessage })
    process.exit(1)
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', error => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack })
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise })
  process.exit(1)
})

startServer()
