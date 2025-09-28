import { readFileSync } from 'fs'
import { resolve } from 'path'

import { MillenniumFalconConfig } from '../types/routeTypes'

// Global config cache
let globalConfig: MillenniumFalconConfig | null = null

export const loadConfig = (configPath: string): MillenniumFalconConfig => {
  try {
    const configData = readFileSync(configPath, 'utf8')
    const config = JSON.parse(configData) as {
      autonomy: number
      departure: string
      routes_db: string
    }

    // Validate autonomy field
    if (config.autonomy === undefined || config.autonomy === null) {
      throw new Error('Invalid configuration: missing required field "autonomy"')
    }

    if (typeof config.autonomy !== 'number') {
      throw new Error('Invalid configuration: "autonomy" must be a number')
    }

    if (config.autonomy <= 0) {
      throw new Error('Invalid configuration: "autonomy" must be positive')
    }

    // Validate departure field
    if (config.departure === undefined || config.departure === null) {
      throw new Error('Invalid configuration: missing required field "departure"')
    }

    if (typeof config.departure !== 'string') {
      throw new Error('Invalid configuration: "departure" must be a string')
    }

    if (config.departure.trim() === '') {
      throw new Error('Invalid configuration: "departure" cannot be empty')
    }

    // Validate routes_db field
    if (config.routes_db === undefined || config.routes_db === null) {
      throw new Error('Invalid configuration: missing required field "routes_db"')
    }

    if (typeof config.routes_db !== 'string') {
      throw new Error('Invalid configuration: "routes_db" must be a string')
    }

    if (config.routes_db.trim() === '') {
      throw new Error('Invalid configuration: "routes_db" cannot be empty')
    }

    // Resolve the database path relative to the config file
    const configDir = resolve(configPath, '..')
    const resolvedDbPath = resolve(configDir, config.routes_db)

    return {
      autonomy: config.autonomy,
      departure: config.departure,
      routesDb: resolvedDbPath,
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON configuration: ${error.message}`)
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    throw new Error(`Failed to load configuration: ${errorMessage}`)
  }
}

export const initializeConfig = (config: MillenniumFalconConfig): void => {
  globalConfig = config
}

export const getConfig = (): MillenniumFalconConfig => {
  if (!globalConfig) {
    throw new Error('Config not initialized. Call initializeConfig() first.')
  }
  return globalConfig
}
