import { CustomError, createError, validateComputeRequest } from '../src/utils/middleware'

// Mock the routeCache module
jest.mock('../src/utils/routeCache', () => ({
  getRouteMap: jest.fn(() => {
    const mockRouteMap = new Map()
    mockRouteMap.set('Tatooine', new Map())
    mockRouteMap.set('Endor', new Map())
    mockRouteMap.set('Dagobah', new Map())
    mockRouteMap.set('Hoth', new Map())
    return mockRouteMap
  }),
}))

describe('Middleware', () => {
  describe('CustomError', () => {
    it('Given a message and status code, When creating CustomError, Then it should have the correct message', () => {
      const message = 'Test error'
      const statusCode = 400

      const error = new CustomError(message, statusCode)

      expect(error.message).toBe('Test error')
    })

    it('Given a message and status code, When creating CustomError, Then it should have the correct status code', () => {
      const message = 'Test error'
      const statusCode = 400

      const error = new CustomError(message, statusCode)

      expect(error.statusCode).toBe(400)
    })

    it('Given a message and status code, When creating CustomError, Then it should have operational flag set to true', () => {
      const message = 'Test error'
      const statusCode = 400

      const error = new CustomError(message, statusCode)

      expect(error.isOperational).toBe(true)
    })

    it('Given only a message, When creating CustomError, Then it should have default status code of 500', () => {
      const message = 'Test error'

      const error = new CustomError(message)

      expect(error.statusCode).toBe(500)
    })
  })

  describe('createError', () => {
    it('Given a message and status code, When calling createError, Then it should return CustomError instance', () => {
      const message = 'Test error'
      const statusCode = 400

      const error = createError(message, statusCode)

      expect(error).toBeInstanceOf(CustomError)
    })

    it('Given a message and status code, When calling createError, Then it should have the correct message', () => {
      const message = 'Test error'
      const statusCode = 400

      const error = createError(message, statusCode)

      expect(error.message).toBe('Test error')
    })

    it('Given a message and status code, When calling createError, Then it should have the correct status code', () => {
      const message = 'Test error'
      const statusCode = 400

      const error = createError(message, statusCode)

      expect(error.statusCode).toBe(400)
    })
  })

  describe('validateComputeRequest', () => {
    it('Given a valid request with arrival planet, When validating, Then it should return the validated request', () => {
      const request = { arrival: 'Endor' }

      const result = validateComputeRequest(request)

      expect(result).toEqual({ arrival: 'Endor' })
    })

    it('Given a request with whitespace in arrival field, When validating, Then it should trim the whitespace', () => {
      const request = { arrival: '  Endor  ' }

      const result = validateComputeRequest(request)

      expect(result).toEqual({ arrival: 'Endor' })
    })

    it('Given a request with missing arrival field, When validating, Then it should throw error', () => {
      const request = {} as any

      expect(() => {
        validateComputeRequest(request)
      }).toThrow('Missing or invalid arrival field')
    })

    it('Given a request with invalid arrival type, When validating, Then it should throw error', () => {
      const request = { arrival: 123 } as any

      expect(() => {
        validateComputeRequest(request)
      }).toThrow('Missing or invalid arrival field')
    })

    it('Given a request with empty arrival string, When validating, Then it should throw error', () => {
      const request = { arrival: '' }

      expect(() => {
        validateComputeRequest(request)
      }).toThrow('Missing or invalid arrival field')
    })

    it('Given a non-object request body, When validating, Then it should throw error', () => {
      const request = 'invalid' as any

      expect(() => {
        validateComputeRequest(request)
      }).toThrow('Request body must be an object')
    })

    it('Given a null request body, When validating, Then it should throw error', () => {
      const request = null as any

      expect(() => {
        validateComputeRequest(request)
      }).toThrow('Request body must be an object')
    })

    it('Given a request with non-existing arrival planet, When validating, Then it should throw error', () => {
      const request = { arrival: 'Coruscant' }

      expect(() => {
        validateComputeRequest(request)
      }).toThrow("Arrival planet 'Coruscant' not found in available routes")
    })
  })
})
