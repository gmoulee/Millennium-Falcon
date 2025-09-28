import {
  calculateFuelAfterTravel,
  computeRoute,
  createPathNode,
  findOptimalRoute,
  getDestinations,
  needsRefueling,
  travelToPlanet,
} from '../src/services/routeService'
import { Route } from '../src/types/routeTypes'
import { planetExists } from '../src/utils/middleware'

// Mock the config module
jest.mock('../src/utils/config', () => ({
  getConfig: jest.fn(() => ({
    autonomy: 6,
    departure: 'Tatooine',
    routesDb: './config/universe.db',
  })),
}))

// Mock the routeCache module
jest.mock('../src/utils/routeCache', () => ({
  getRouteMap: jest.fn(() => {
    const mockRouteMap = new Map()

    // Create a proper route map with actual routes
    const tatooineRoutes = new Map()
    tatooineRoutes.set('Dagobah', 6)
    tatooineRoutes.set('Hoth', 6)
    mockRouteMap.set('Tatooine', tatooineRoutes)

    const dagobahRoutes = new Map()
    dagobahRoutes.set('Tatooine', 6)
    dagobahRoutes.set('Endor', 4)
    dagobahRoutes.set('Hoth', 1)
    mockRouteMap.set('Dagobah', dagobahRoutes)

    const endorRoutes = new Map()
    endorRoutes.set('Dagobah', 4)
    endorRoutes.set('Hoth', 1)
    mockRouteMap.set('Endor', endorRoutes)

    const hothRoutes = new Map()
    hothRoutes.set('Tatooine', 6)
    hothRoutes.set('Dagobah', 1)
    hothRoutes.set('Endor', 1)
    mockRouteMap.set('Hoth', hothRoutes)

    return mockRouteMap
  }),
}))

describe('RouteService', () => {
  describe('computeRoute', () => {
    it('Given valid arrival planet, When computing route, Then it should compute successfully', () => {
      const arrival = 'Endor'

      const result = computeRoute(arrival)

      expect(result).toHaveProperty('duration')
    })

    it('Given valid arrival planet, When computing route, Then it should return route with correct structure', () => {
      const arrival = 'Endor'

      const result = computeRoute(arrival)

      expect(result).toHaveProperty('route')
    })

    it('Given valid arrival planet, When computing route, Then it should return route as array', () => {
      const arrival = 'Endor'

      const result = computeRoute(arrival)

      expect(Array.isArray(result.route)).toBe(true)
    })

    it('Given valid arrival planet, When computing route, Then it should start route with departure planet', () => {
      const arrival = 'Endor'

      const result = computeRoute(arrival)

      expect(result.route[0]).toBe('Tatooine')
    })

    it('Given valid arrival planet, When computing route, Then it should end route with arrival planet', () => {
      const arrival = 'Endor'

      const result = computeRoute(arrival)

      expect(result.route[result.route.length - 1]).toBe('Endor')
    })

    it('Given same departure and arrival planet, When computing route, Then it should return zero duration', () => {
      const arrival = 'Tatooine'

      const result = computeRoute(arrival)

      expect(result.duration).toBe(0)
    })

    it('Given same departure and arrival planet, When computing route, Then it should return single planet route', () => {
      const arrival = 'Tatooine'

      const result = computeRoute(arrival)

      expect(result.route).toEqual(['Tatooine'])
    })

    it('Given non-existing arrival planet, When computing route, Then it should throw error', () => {
      const arrival = 'Coruscant'

      expect(() => {
        computeRoute(arrival)
      }).toThrow('No route found')
    })
  })

  describe('planetExists', () => {
    it('Given existing planet Tatooine, When checking if planet exists, Then it should return true', () => {
      const mockRouteMap = new Map()
      mockRouteMap.set('Tatooine', new Map())
      const planet = 'Tatooine'

      const result = planetExists(planet, mockRouteMap)

      expect(result).toBe(true)
    })

    it('Given existing planet Endor, When checking if planet exists, Then it should return true', () => {
      const mockRouteMap = new Map()
      mockRouteMap.set('Endor', new Map())
      const planet = 'Endor'

      const result = planetExists(planet, mockRouteMap)

      expect(result).toBe(true)
    })

    it('Given non-existing planet Coruscant, When checking if planet exists, Then it should return false', () => {
      const mockRouteMap = new Map()
      mockRouteMap.set('Tatooine', new Map())
      const planet = 'Coruscant'

      const result = planetExists(planet, mockRouteMap)

      expect(result).toBe(false)
    })

    it('Given non-existing planet Alderaan, When checking if planet exists, Then it should return false', () => {
      const mockRouteMap = new Map()
      mockRouteMap.set('Tatooine', new Map())
      const planet = 'Alderaan'

      const result = planetExists(planet, mockRouteMap)

      expect(result).toBe(false)
    })
  })
})

describe('Pathfinding Algorithm', () => {
  const sampleRoutes: readonly Route[] = [
    { origin: 'Tatooine', destination: 'Dagobah', travelTime: 6 },
    { origin: 'Dagobah', destination: 'Endor', travelTime: 4 },
    { origin: 'Dagobah', destination: 'Hoth', travelTime: 1 },
    { origin: 'Hoth', destination: 'Endor', travelTime: 1 },
    { origin: 'Tatooine', destination: 'Hoth', travelTime: 6 },
  ]

  // Helper function to create route map for tests
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

  describe('createRouteMap', () => {
    it('Given sample routes, When creating route map, Then it should include Tatooine', () => {
      const routes = sampleRoutes

      const routeMap = createRouteMap(routes)

      expect(routeMap.has('Tatooine')).toBe(true)
    })

    it('Given sample routes, When creating route map, Then it should include Dagobah', () => {
      const routes = sampleRoutes

      const routeMap = createRouteMap(routes)

      expect(routeMap.has('Dagobah')).toBe(true)
    })

    it('Given sample routes, When creating route map, Then it should include Endor', () => {
      const routes = sampleRoutes

      const routeMap = createRouteMap(routes)

      expect(routeMap.has('Endor')).toBe(true)
    })

    it('Given sample routes, When creating route map, Then it should include Hoth', () => {
      const routes = sampleRoutes

      const routeMap = createRouteMap(routes)

      expect(routeMap.has('Hoth')).toBe(true)
    })

    it('Given sample routes, When creating route map, Then it should create bidirectional route from Tatooine to Dagobah', () => {
      const routes = sampleRoutes

      const routeMap = createRouteMap(routes)

      expect(routeMap.get('Tatooine')?.get('Dagobah')).toBe(6)
    })

    it('Given sample routes, When creating route map, Then it should create bidirectional route from Dagobah to Tatooine', () => {
      const routes = sampleRoutes

      const routeMap = createRouteMap(routes)

      expect(routeMap.get('Dagobah')?.get('Tatooine')).toBe(6)
    })

    it('Given sample routes, When creating route map, Then it should create bidirectional route from Dagobah to Endor', () => {
      const routes = sampleRoutes

      const routeMap = createRouteMap(routes)

      expect(routeMap.get('Dagobah')?.get('Endor')).toBe(4)
    })

    it('Given sample routes, When creating route map, Then it should create bidirectional route from Endor to Dagobah', () => {
      const routes = sampleRoutes

      const routeMap = createRouteMap(routes)

      expect(routeMap.get('Endor')?.get('Dagobah')).toBe(4)
    })

    it('Given empty routes array, When creating route map, Then it should return empty map', () => {
      const routes: readonly Route[] = []

      const routeMap = createRouteMap(routes)

      expect(routeMap.size).toBe(0)
    })
  })

  describe('getDestinations', () => {
    it('Given planet Dagobah, When getting destinations, Then it should return correct number of destinations', () => {
      const routeMap = createRouteMap(sampleRoutes)
      const planet = 'Dagobah'

      const destinations = getDestinations(planet, routeMap)

      expect(destinations).toHaveLength(3)
    })

    it('Given planet Dagobah, When getting destinations, Then it should include Tatooine', () => {
      const routeMap = createRouteMap(sampleRoutes)
      const planet = 'Dagobah'

      const destinations = getDestinations(planet, routeMap)

      expect(destinations.map(d => d.destination)).toContain('Tatooine')
    })

    it('Given planet Dagobah, When getting destinations, Then it should include Endor', () => {
      const routeMap = createRouteMap(sampleRoutes)
      const planet = 'Dagobah'

      const destinations = getDestinations(planet, routeMap)

      expect(destinations.map(d => d.destination)).toContain('Endor')
    })

    it('Given planet Dagobah, When getting destinations, Then it should include Hoth', () => {
      const routeMap = createRouteMap(sampleRoutes)
      const planet = 'Dagobah'

      const destinations = getDestinations(planet, routeMap)

      expect(destinations.map(d => d.destination)).toContain('Hoth')
    })

    it('Given non-existing planet, When getting destinations, Then it should return empty array', () => {
      const routeMap = createRouteMap(sampleRoutes)
      const planet = 'Coruscant'

      const destinations = getDestinations(planet, routeMap)

      expect(destinations).toHaveLength(0)
    })
  })

  describe('calculateFuelAfterTravel', () => {
    it('Given sufficient fuel and travel time, When calculating fuel after travel, Then it should reduce fuel by travel time', () => {
      const currentFuel = 10
      const travelTime = 3

      const result = calculateFuelAfterTravel(currentFuel, travelTime)

      expect(result).toBe(7)
    })

    it('Given different fuel values, When calculating fuel after travel, Then it should reduce fuel by travel time', () => {
      const currentFuel = 5
      const travelTime = 2

      const result = calculateFuelAfterTravel(currentFuel, travelTime)

      expect(result).toBe(3)
    })

    it('Given insufficient fuel, When calculating fuel after travel, Then it should not go below zero', () => {
      const currentFuel = 2
      const travelTime = 5

      const result = calculateFuelAfterTravel(currentFuel, travelTime)

      expect(result).toBe(0)
    })
  })

  describe('needsRefueling', () => {
    it('Given insufficient fuel for travel, When checking if refueling is needed, Then it should return true', () => {
      const currentFuel = 3
      const travelTime = 5

      const result = needsRefueling(currentFuel, travelTime)

      expect(result).toBe(true)
    })

    it('Given zero fuel, When checking if refueling is needed, Then it should return true', () => {
      const currentFuel = 0
      const travelTime = 1

      const result = needsRefueling(currentFuel, travelTime)

      expect(result).toBe(true)
    })

    it('Given sufficient fuel for travel, When checking if refueling is needed, Then it should return false', () => {
      const currentFuel = 5
      const travelTime = 3

      const result = needsRefueling(currentFuel, travelTime)

      expect(result).toBe(false)
    })

    it('Given fuel equals travel time, When checking if refueling is needed, Then it should return false', () => {
      const currentFuel = 10
      const travelTime = 10

      const result = needsRefueling(currentFuel, travelTime)

      expect(result).toBe(false)
    })
  })

  describe('createPathNode', () => {
    it('Given planet name, When creating path node, Then it should have correct planet', () => {
      const planet = 'Tatooine'
      const totalDays = 0
      const fuelRemaining = 6
      const route = ['Tatooine']

      const node = createPathNode(planet, totalDays, fuelRemaining, route)

      expect(node.planet).toBe('Tatooine')
    })

    it('Given total days, When creating path node, Then it should have correct total days', () => {
      const planet = 'Tatooine'
      const totalDays = 0
      const fuelRemaining = 6
      const route = ['Tatooine']

      const node = createPathNode(planet, totalDays, fuelRemaining, route)

      expect(node.totalDays).toBe(0)
    })

    it('Given fuel remaining, When creating path node, Then it should have correct fuel remaining', () => {
      const planet = 'Tatooine'
      const totalDays = 0
      const fuelRemaining = 6
      const route = ['Tatooine']

      const node = createPathNode(planet, totalDays, fuelRemaining, route)

      expect(node.fuelRemaining).toBe(6)
    })

    it('Given route array, When creating path node, Then it should have correct route', () => {
      const planet = 'Tatooine'
      const totalDays = 0
      const fuelRemaining = 6
      const route = ['Tatooine']

      const node = createPathNode(planet, totalDays, fuelRemaining, route)

      expect(node.route).toEqual(['Tatooine'])
    })
  })

  describe('travelToPlanet', () => {
    it('Given sufficient fuel, When traveling to planet, Then it should reach destination', () => {
      const currentNode = createPathNode('Tatooine', 0, 6, ['Tatooine'])
      const destination = 'Dagobah'
      const travelTime = 4
      const autonomy = 6

      const nextNode = travelToPlanet(currentNode, destination, travelTime, autonomy)

      expect(nextNode.planet).toBe('Dagobah')
    })

    it('Given sufficient fuel, When traveling to planet, Then it should calculate correct total days', () => {
      const currentNode = createPathNode('Tatooine', 0, 6, ['Tatooine'])
      const destination = 'Dagobah'
      const travelTime = 4
      const autonomy = 6

      const nextNode = travelToPlanet(currentNode, destination, travelTime, autonomy)

      expect(nextNode.totalDays).toBe(4)
    })

    it('Given sufficient fuel, When traveling to planet, Then it should calculate correct fuel remaining', () => {
      const currentNode = createPathNode('Tatooine', 0, 6, ['Tatooine'])
      const destination = 'Dagobah'
      const travelTime = 4
      const autonomy = 6

      const nextNode = travelToPlanet(currentNode, destination, travelTime, autonomy)

      expect(nextNode.fuelRemaining).toBe(2)
    })

    it('Given sufficient fuel, When traveling to planet, Then it should update route', () => {
      const currentNode = createPathNode('Tatooine', 0, 6, ['Tatooine'])
      const destination = 'Dagobah'
      const travelTime = 4
      const autonomy = 6

      const nextNode = travelToPlanet(currentNode, destination, travelTime, autonomy)

      expect(nextNode.route).toEqual(['Tatooine', 'Dagobah'])
    })

    it('Given insufficient fuel, When traveling to planet, Then it should refuel and reach destination', () => {
      const currentNode = createPathNode('Tatooine', 0, 3, ['Tatooine'])
      const destination = 'Dagobah'
      const travelTime = 4
      const autonomy = 6

      const nextNode = travelToPlanet(currentNode, destination, travelTime, autonomy)

      expect(nextNode.planet).toBe('Dagobah')
    })

    it('Given insufficient fuel, When traveling to planet, Then it should add refuel day', () => {
      const currentNode = createPathNode('Tatooine', 0, 3, ['Tatooine'])
      const destination = 'Dagobah'
      const travelTime = 4
      const autonomy = 6

      const nextNode = travelToPlanet(currentNode, destination, travelTime, autonomy)

      expect(nextNode.totalDays).toBe(5) // 4 travel + 1 refuel
    })

    it('Given insufficient fuel, When traveling to planet, Then it should calculate correct fuel after refueling', () => {
      const currentNode = createPathNode('Tatooine', 0, 3, ['Tatooine'])
      const destination = 'Dagobah'
      const travelTime = 4
      const autonomy = 6

      const nextNode = travelToPlanet(currentNode, destination, travelTime, autonomy)

      expect(nextNode.fuelRemaining).toBe(2) // 6 autonomy - 4 travel
    })

    it('Given insufficient fuel, When traveling to planet, Then it should update route', () => {
      const currentNode = createPathNode('Tatooine', 0, 3, ['Tatooine'])
      const destination = 'Dagobah'
      const travelTime = 4
      const autonomy = 6

      const nextNode = travelToPlanet(currentNode, destination, travelTime, autonomy)

      expect(nextNode.route).toEqual(['Tatooine', 'Dagobah'])
    })
  })

  describe('findOptimalRoute', () => {
    it('Given valid departure and arrival planets, When finding optimal route, Then it should find route', () => {
      const routeMap = createRouteMap(sampleRoutes)
      const departure = 'Tatooine'
      const arrival = 'Endor'
      const autonomy = 6

      const result = findOptimalRoute(departure, arrival, routeMap, autonomy)

      expect(result).not.toBeNull()
    })

    it('Given valid departure and arrival planets, When finding optimal route, Then it should return correct duration', () => {
      const routeMap = createRouteMap(sampleRoutes)
      const departure = 'Tatooine'
      const arrival = 'Endor'
      const autonomy = 6

      const result = findOptimalRoute(departure, arrival, routeMap, autonomy)

      expect(result!.duration).toBe(8) // Tatooine -> Hoth (6) + refuel (1) + Hoth -> Endor (1)
    })

    it('Given valid departure and arrival planets, When finding optimal route, Then it should return correct route', () => {
      const routeMap = createRouteMap(sampleRoutes)
      const departure = 'Tatooine'
      const arrival = 'Endor'
      const autonomy = 6

      const result = findOptimalRoute(departure, arrival, routeMap, autonomy)

      expect(result!.route).toEqual(['Tatooine', 'Hoth', 'Endor'])
    })

    it('Given non-existing departure planet, When finding optimal route, Then it should return null', () => {
      const routeMap = createRouteMap(sampleRoutes)
      const departure = 'Coruscant'
      const arrival = 'Endor'
      const autonomy = 6

      const result = findOptimalRoute(departure, arrival, routeMap, autonomy)

      expect(result).toBeNull()
    })

    it('Given non-existing arrival planet, When finding optimal route, Then it should return null', () => {
      const routeMap = createRouteMap(sampleRoutes)
      const departure = 'Tatooine'
      const arrival = 'Coruscant'
      const autonomy = 6

      const result = findOptimalRoute(departure, arrival, routeMap, autonomy)

      expect(result).toBeNull()
    })

    it('Given same departure and arrival planet, When finding optimal route, Then it should return zero duration', () => {
      const routeMap = createRouteMap(sampleRoutes)
      const departure = 'Tatooine'
      const arrival = 'Tatooine'
      const autonomy = 6

      const result = findOptimalRoute(departure, arrival, routeMap, autonomy)

      expect(result).toEqual({
        duration: 0,
        route: ['Tatooine'],
      })
    })

    it('Given complex routes with multiple refueling stops, When finding optimal route, Then it should find route', () => {
      const complexRoutes: readonly Route[] = [
        { origin: 'A', destination: 'B', travelTime: 4 },
        { origin: 'B', destination: 'C', travelTime: 4 },
        { origin: 'C', destination: 'D', travelTime: 4 },
      ]
      const routeMap = createRouteMap(complexRoutes)
      const departure = 'A'
      const arrival = 'D'
      const autonomy = 6

      const result = findOptimalRoute(departure, arrival, routeMap, autonomy)

      expect(result).not.toBeNull()
    })

    it('Given complex routes with multiple refueling stops, When finding optimal route, Then it should calculate correct duration', () => {
      const complexRoutes: readonly Route[] = [
        { origin: 'A', destination: 'B', travelTime: 4 },
        { origin: 'B', destination: 'C', travelTime: 4 },
        { origin: 'C', destination: 'D', travelTime: 4 },
      ]
      const routeMap = createRouteMap(complexRoutes)
      const departure = 'A'
      const arrival = 'D'
      const autonomy = 6

      const result = findOptimalRoute(departure, arrival, routeMap, autonomy)

      // A -> B (4 days) -> C (4 days + 1 refuel) -> D (4 days + 1 refuel) = 14 days total
      expect(result!.duration).toBe(14)
    })

    it('Given isolated routes with no connection, When finding optimal route, Then it should return null', () => {
      const isolatedRoutes: readonly Route[] = [
        { origin: 'A', destination: 'B', travelTime: 1 },
        { origin: 'C', destination: 'D', travelTime: 1 },
      ]
      const routeMap = createRouteMap(isolatedRoutes)
      const departure = 'A'
      const arrival = 'C'
      const autonomy = 6

      const result = findOptimalRoute(departure, arrival, routeMap, autonomy)

      expect(result).toBeNull()
    })
  })
})
