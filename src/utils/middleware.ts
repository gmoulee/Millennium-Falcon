import { NextFunction, Request, Response } from 'express'
import { ComputeRequest } from '../types/routeTypes'
import { logger } from './logger'
import { getRouteMap } from './routeCache'

export interface AppError extends Error {
  statusCode?: number
  isOperational?: boolean
}

export class CustomError extends Error implements AppError {
  public readonly statusCode: number
  public readonly isOperational: boolean

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational

    Error.captureStackTrace(this, this.constructor)
  }
}

export const createError = (message: string, statusCode: number = 500): CustomError => {
  return new CustomError(message, statusCode)
}

export const validateComputeRequest = (body: ComputeRequest): ComputeRequest => {
  if (!body || typeof body !== 'object') {
    throw createError('Request body must be an object', 400)
  }

  if (!body.arrival || typeof body.arrival !== 'string' || body.arrival.trim() === '') {
    throw createError('Missing or invalid arrival field', 400)
  }

  const arrival = body.arrival.trim()

  // Validate that arrival planet exists in available routes
  const routeMap = getRouteMap()
  if (!planetExists(arrival, routeMap)) {
    const availablePlanets = Array.from(routeMap.keys())
    throw createError(
      `Arrival planet '${arrival}' not found in available routes. ` +
        `Available planets: ${availablePlanets.join(', ')}`,
      404
    )
  }

  return {
    arrival,
  }
}

// Pure function to check if a planet exists in the route map
export const planetExists = (
  planet: string,
  routeMap: Map<string, Map<string, number>>
): boolean => {
  return routeMap.has(planet)
}

export const validateDeparture = (departure: string): void => {
  const routeMap = getRouteMap()

  // Check if departure planet exists in routes
  if (!planetExists(departure, routeMap)) {
    const availablePlanets = Array.from(routeMap.keys())
    throw createError(
      `Departure planet '${departure}' not found in available routes. ` +
        `Available planets: ${availablePlanets.join(', ')}`,
      400
    )
  }

  logger.info('Departure planet validation successful', {
    departure,
    totalPlanets: routeMap.size,
    availablePlanets: Array.from(routeMap.keys()),
  })
}

export const errorHandler = (
  error: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const { statusCode = 500, message } = error

  // Log error for debugging
  console.error(`Error ${statusCode}: ${message}`)
  console.error(error.stack)

  res.status(statusCode).json({
    error: {
      message: statusCode === 500 ? 'Internal server error' : message,
      statusCode,
    },
  })
}

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    error: {
      message: `Route ${req.method} ${req.path} not found`,
      statusCode: 404,
    },
  })
}
