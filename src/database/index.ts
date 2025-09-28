import { Database, open } from 'sqlite'

import { Route } from '../types/routeTypes'

export const createDatabase = async (dbPath: string): Promise<Database> => {
  try {
    return await open({
      filename: dbPath,
      driver: require('sqlite3').Database,
    })
  } catch (err) {
    throw new Error(
      `Failed to open database: ${err instanceof Error ? err.message : 'Unknown error'}`
    )
  }
}

export const getAllRoutes = async (db: Database): Promise<readonly Route[]> => {
  try {
    const query = 'SELECT origin, destination, travel_time as travelTime FROM routes'
    const rows = await db.all(query)

    return rows
  } catch (err) {
    throw new Error(
      `Failed to fetch routes: ${err instanceof Error ? err.message : 'Unknown error'}`
    )
  }
}

export const closeDatabase = async (db: Database): Promise<void> => {
  try {
    await db.close()
  } catch (err) {
    throw new Error(
      `Failed to close database: ${err instanceof Error ? err.message : 'Unknown error'}`
    )
  }
}
