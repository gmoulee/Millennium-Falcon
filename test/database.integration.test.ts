import { closeDatabase, createDatabase, getAllRoutes } from '../src/database'

describe('Database Integration Tests', () => {
  describe('createDatabase', () => {
    it('Given valid database path, When creating database connection, Then it should create successfully', async () => {
      const dbPath = './config/universe.db'

      const db = await createDatabase(dbPath)

      expect(db).toBeDefined()
      await closeDatabase(db)
    })

    it('Given invalid database path, When creating database connection, Then it should throw error', async () => {
      const dbPath = '/invalid/path/that/does/not/exist.db'

      await expect(createDatabase(dbPath)).rejects.toThrow('Failed to open database')
    })
  })

  describe('getAllRoutes', () => {
    it('Given valid database connection, When fetching routes, Then it should fetch routes', async () => {
      const db = await createDatabase('./config/universe.db')

      try {
        const routes = await getAllRoutes(db)

        expect(routes.length).toBeGreaterThan(0)
      } finally {
        await closeDatabase(db)
      }
    })

    it('Given valid database connection, When fetching routes, Then it should return routes with origin field', async () => {
      const db = await createDatabase('./config/universe.db')

      try {
        const routes = await getAllRoutes(db)

        routes.forEach(route => {
          expect(route.origin).toBeDefined()
        })
      } finally {
        await closeDatabase(db)
      }
    })

    it('Given valid database connection, When fetching routes, Then it should return routes with destination field', async () => {
      const db = await createDatabase('./config/universe.db')

      try {
        const routes = await getAllRoutes(db)

        routes.forEach(route => {
          expect(route.destination).toBeDefined()
        })
      } finally {
        await closeDatabase(db)
      }
    })

    it('Given valid database connection, When fetching routes, Then it should return routes with positive travel time', async () => {
      const db = await createDatabase('./config/universe.db')

      try {
        const routes = await getAllRoutes(db)

        routes.forEach(route => {
          expect(route.travelTime).toBeGreaterThan(0)
        })
      } finally {
        await closeDatabase(db)
      }
    })
  })
})
