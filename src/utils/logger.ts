import { NextFunction, Request, Response } from 'express'
import pino from 'pino'

// Create Pino logger instance
const loggerOptions: pino.LoggerOptions = {
  level: process.env['LOG_LEVEL'] || 'info',
  base: {
    service: 'millennium-falcon-api',
    version: process.env['npm_package_version'] || '1.0.0',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
}

if (process.env['NODE_ENV'] === 'development') {
  loggerOptions.transport = {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname,service,version',
      messageFormat: '{msg}',
      singleLine: false,
    },
  }
}

export const logger = pino(loggerOptions)

// Request logging middleware using pino-http
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now()

  res.on('finish', () => {
    const duration = Date.now() - startTime
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
    }

    if (res.statusCode >= 400) {
      logger.warn(logData, 'HTTP Request')
    } else {
      logger.info(logData, 'HTTP Request')
    }
  })

  next()
}
