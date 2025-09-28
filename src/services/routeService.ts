import { ComputeResponse, PathNode } from '../types/routeTypes'
import { getConfig } from '../utils/config'
import { getRouteMap } from '../utils/routeCache'

export const computeRoute = (arrival: string): ComputeResponse => {
  const config = getConfig()
  const { departure, autonomy } = config
  const routeMap = getRouteMap()
  // Validate arrival planet
  if (arrival === departure) {
    return {
      duration: 0,
      route: [departure],
    }
  }

  // Find optimal route
  const result = findOptimalRoute(departure, arrival, routeMap, autonomy)

  if (!result) {
    throw new Error(`No route found from ${departure} to ${arrival}`)
  }

  return result
}

// Pure function to get available destinations from a planet
export const getDestinations = (
  planet: string,
  routeMap: Map<string, Map<string, number>>
): readonly { destination: string; travelTime: number }[] => {
  const destinations = routeMap.get(planet)
  if (!destinations) {
    return []
  }

  return Array.from(destinations.entries()).map(([destination, travelTime]) => ({
    destination,
    travelTime,
  }))
}

// Pure function to calculate fuel after travel
export const calculateFuelAfterTravel = (currentFuel: number, travelTime: number): number => {
  return Math.max(0, currentFuel - travelTime)
}

// Pure function to check if refueling is needed
export const needsRefueling = (currentFuel: number, travelTime: number): boolean => {
  return currentFuel < travelTime
}

// Pure function to create a new path node
export const createPathNode = (
  planet: string,
  totalDays: number,
  fuelRemaining: number,
  route: readonly string[]
): PathNode => ({
  planet,
  totalDays,
  fuelRemaining,
  route,
})

// Pure function to create a new path node after travel
export const travelToPlanet = (
  currentNode: PathNode,
  destination: string,
  travelTime: number,
  autonomy: number
): PathNode => {
  const needsRefuel = needsRefueling(currentNode.fuelRemaining, travelTime)

  // If travel time exceeds autonomy, we can't make this trip even with refueling
  if (travelTime > autonomy) {
    return createPathNode(destination, currentNode.totalDays, -1, currentNode.route)
  }

  const refuelDays = needsRefuel ? 1 : 0
  const totalDays = currentNode.totalDays + travelTime + refuelDays
  const fuelAfterTravel = needsRefuel
    ? autonomy - travelTime
    : currentNode.fuelRemaining - travelTime
  const newRoute = [...currentNode.route, destination]

  return createPathNode(destination, totalDays, fuelAfterTravel, newRoute)
}

// Main pathfinding algorithm using Dijkstra's algorithm with fuel constraints
export const findOptimalRoute = (
  departure: string,
  arrival: string,
  routeMap: Map<string, Map<string, number>>,
  autonomy: number
): ComputeResponse | null => {
  if (departure === arrival) {
    return { duration: 0, route: [departure] }
  }

  const visited = new Set<string>()
  const queue: PathNode[] = [createPathNode(departure, 0, autonomy, [departure])]

  while (queue.length > 0) {
    // Sort queue by total days (Dijkstra's algorithm)
    queue.sort((a, b) => a.totalDays - b.totalDays)
    const currentNode = queue.shift()!

    // Check if we've reached the destination
    if (currentNode.planet === arrival) {
      return {
        duration: currentNode.totalDays,
        route: currentNode.route,
      }
    }

    // Skip if we've already visited this planet with better or equal fuel/time
    // Include totalDays to avoid pruning routes that reach the same planet with fewer days
    const nodeKey = `${currentNode.planet}-${currentNode.fuelRemaining}-${currentNode.totalDays}`
    if (visited.has(nodeKey)) {
      continue
    }
    visited.add(nodeKey)

    // Explore all possible destinations
    const destinations = getDestinations(currentNode.planet, routeMap)

    destinations.forEach(({ destination, travelTime }) => {
      // Skip if we've already visited this destination in our current route
      if (currentNode.route.includes(destination)) {
        return
      }

      const nextNode = travelToPlanet(currentNode, destination, travelTime, autonomy)

      // Only add to queue if we have enough fuel or can refuel
      if (nextNode.fuelRemaining >= 0) {
        queue.push(nextNode)
      }
    })
  }

  return null // No route found
}
