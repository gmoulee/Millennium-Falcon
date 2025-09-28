import { readFileSync } from 'fs'
import { resolve } from 'path'
import { MillenniumFalconConfig } from '../src/types/routeTypes'
import { getConfig, initializeConfig, loadConfig } from '../src/utils/config'

// Mock fs module
jest.mock('fs')
jest.mock('path')

const mockReadFileSync = readFileSync as jest.MockedFunction<typeof readFileSync>
const mockResolve = resolve as jest.MockedFunction<typeof resolve>

describe('Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  describe('loadConfig', () => {
    it('Given valid config file, When loading config, Then it should load correct autonomy value', () => {
      const configPath = './test/fixtures/valid.json'
      const mockConfigData = JSON.stringify({
        autonomy: 6,
        departure: 'Tatooine',
        routes_db: 'universe.db',
      })

      mockReadFileSync.mockReturnValue(mockConfigData)
      mockResolve.mockReturnValue('/resolved/path/universe.db')

      const config = loadConfig(configPath)

      expect(config.autonomy).toBe(6)
      expect(mockReadFileSync).toHaveBeenCalledWith(configPath, 'utf8')
    })

    it('Given valid config file, When loading config, Then it should load correct departure planet', () => {
      const configPath = './test/fixtures/valid.json'
      const mockConfigData = JSON.stringify({
        autonomy: 6,
        departure: 'Tatooine',
        routes_db: 'universe.db',
      })

      mockReadFileSync.mockReturnValue(mockConfigData)
      mockResolve.mockReturnValue('/resolved/path/universe.db')

      const config = loadConfig(configPath)

      expect(config.departure).toBe('Tatooine')
    })

    it('Given valid config file, When loading config, Then it should load correct routes database path', () => {
      const configPath = './test/fixtures/valid.json'
      const mockConfigData = JSON.stringify({
        autonomy: 6,
        departure: 'Tatooine',
        routes_db: 'universe.db',
      })

      mockReadFileSync.mockReturnValue(mockConfigData)
      mockResolve.mockReturnValue('/resolved/path/universe.db')

      const config = loadConfig(configPath)

      expect(config.routesDb).toBe('/resolved/path/universe.db')
      expect(mockResolve).toHaveBeenCalled()
    })

    it('Given invalid JSON config file, When loading config, Then it should throw error', () => {
      const configPath = './test/fixtures/invalid.json'

      mockReadFileSync.mockReturnValue('{ invalid json }')

      expect(() => {
        loadConfig(configPath)
      }).toThrow('Invalid JSON configuration')
    })

    it('Given config file with missing fields, When loading config, Then it should throw error', () => {
      const configPath = './test/fixtures/missing-fields.json'
      const mockConfigData = JSON.stringify({
        autonomy: 6,
        departure: 'Tatooine',
        // routes_db is missing
      })

      mockReadFileSync.mockReturnValue(mockConfigData)

      expect(() => {
        loadConfig(configPath)
      }).toThrow('Invalid configuration: missing required fields')
    })

    it('Given config file with non-positive autonomy, When loading config, Then it should throw error', () => {
      const configPath = './test/fixtures/invalid-autonomy.json'
      const mockConfigData = JSON.stringify({
        autonomy: 0,
        departure: 'Tatooine',
        routes_db: 'universe.db',
      })

      mockReadFileSync.mockReturnValue(mockConfigData)

      expect(() => {
        loadConfig(configPath)
      }).toThrow('Invalid configuration: autonomy must be positive')
    })

    it('Given config file with null autonomy, When loading config, Then it should throw error', () => {
      const configPath = './test/fixtures/valid.json'
      const mockConfigData = JSON.stringify({
        autonomy: null,
        departure: 'Tatooine',
        routes_db: 'universe.db',
      })

      mockReadFileSync.mockReturnValue(mockConfigData)

      expect(() => {
        loadConfig(configPath)
      }).toThrow('Invalid configuration: missing required fields')
    })

    it('Given config file with undefined autonomy, When loading config, Then it should throw error', () => {
      const configPath = './test/fixtures/valid.json'
      const mockConfigData = JSON.stringify({
        departure: 'Tatooine',
        routes_db: 'universe.db',
      })

      mockReadFileSync.mockReturnValue(mockConfigData)

      expect(() => {
        loadConfig(configPath)
      }).toThrow('Invalid configuration: missing required fields')
    })

    it('Given file read error, When loading config, Then it should throw error', () => {
      const configPath = './test/fixtures/valid.json'

      mockReadFileSync.mockImplementation(() => {
        throw new Error('File not found')
      })

      expect(() => {
        loadConfig(configPath)
      }).toThrow('Failed to load configuration: File not found')
    })
  })

  describe('initializeConfig and getConfig', () => {
    it('Given valid config, When initializing config, Then it should store config globally', () => {
      const mockConfig: MillenniumFalconConfig = {
        autonomy: 6,
        departure: 'Tatooine',
        routesDb: '/path/to/universe.db',
      }

      initializeConfig(mockConfig)
      const retrievedConfig = getConfig()

      expect(retrievedConfig).toEqual(mockConfig)
    })

    it('Given no initialized config, When getting config, Then it should throw error', () => {
      // Reset global config
      initializeConfig(null as any)

      expect(() => {
        getConfig()
      }).toThrow('Config not initialized. Call initializeConfig() first.')
    })
  })
})
