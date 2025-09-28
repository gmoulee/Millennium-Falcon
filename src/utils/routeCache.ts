import { closeDatabase, createDatabase, getAllRoutes } from '../database'
import { MillenniumFalconConfig, Route } from '../types/routeTypes'
import { logger } from './logger'

// Global cache variables
let cachedRoutes: Route[] = []
let cachedRouteMap: Map<string, Map<string, number>> | null = null
let isLoaded = false

// Pure function to create a bidirectional route map
const createRouteMap = (routes: readonly Route[]): Map<string, Map<string, number>> => {
  const routeMap = new Map<string, Map<string, number>>()

  const addRoute = (from: string, to: string, time: number): void => {
    if (!routeMap.has(from)) {
      routeMap.set(from, new Map())
    }
    routeMap.get(from)!.set(to, time)
  }

  routes.forEach(route => {
    addRoute(route.origin, route.destination, route.travelTime)
    addRoute(route.destination, route.origin, route.travelTime)
  })

  return routeMap
}

export const loadRoutes = async (config: MillenniumFalconConfig): Promise<void> => {
  if (isLoaded) {
    return
  }

  logger.info(
    {
      databasePath: config.routesDb,
    },
    'Loading routes from database'
  )

  const db = await createDatabase(config.routesDb)

  try {
    cachedRoutes = [...(await getAllRoutes(db))]

    if (cachedRoutes.length === 0) {
      throw new Error('No routes available in database')
    }

    // Create and cache the route map
    cachedRouteMap = createRouteMap(cachedRoutes)

    logger.info(
      {
        routeCount: cachedRoutes.length,
      },
      'Routes loaded successfully'
    )

    isLoaded = true
  } finally {
    await closeDatabase(db)
  }
}

export const getRouteMap = (): Map<string, Map<string, number>> => {
  if (!isLoaded || !cachedRouteMap) {
    throw new Error('Routes not loaded. Call loadRoutes() first.')
  }
  return cachedRouteMap
}
