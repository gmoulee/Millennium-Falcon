// Test setup file
import { jest } from '@jest/globals'

// Increase timeout for database operations
jest.setTimeout(10000)

// Only mock console.error to reduce noise
global.console = {
  ...console,
  error: jest.fn(),
}
