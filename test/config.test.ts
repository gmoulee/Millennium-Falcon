import { closeDatabase, createDatabase, getAllRoutes } from '../src/database'
import { loadConfig } from '../src/utils/config'

describe('Configuration', () => {
  describe('loadConfig', () => {
    it('Given valid config file, When loading config, Then it should load correct autonomy value', () => {
      const configPath = './config/millennium-falcon.json'

      const config = loadConfig(configPath)

      expect(config.autonomy).toBe(6)
    })

    it('Given valid config file, When loading config, Then it should load correct departure planet', () => {
      const configPath = './config/millennium-falcon.json'

      const config = loadConfig(configPath)

      expect(config.departure).toBe('Tatooine')
    })

    it('Given valid config file, When loading config, Then it should load correct routes database path', () => {
      const configPath = './config/millennium-falcon.json'

      const config = loadConfig(configPath)

      expect(config.routesDb).toContain('universe.db')
    })

    it('Given invalid JSON config file, When loading config, Then it should throw error', () => {
      const configPath = './test/fixtures/invalid.json'

      expect(() => {
        loadConfig(configPath)
      }).toThrow('Invalid JSON configuration')
    })

    it('Given config file with missing fields, When loading config, Then it should throw error', () => {
      const configPath = './test/fixtures/missing-fields.json'

      expect(() => {
        loadConfig(configPath)
      }).toThrow('Invalid configuration: missing required fields')
    })

    it('Given config file with non-positive autonomy, When loading config, Then it should throw error', () => {
      const configPath = './test/fixtures/invalid-autonomy.json'

      expect(() => {
        loadConfig(configPath)
      }).toThrow('Invalid configuration: autonomy must be positive')
    })
  })
})

describe('Database', () => {
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
