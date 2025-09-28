import { Request, Response } from 'express'
import { computeRouteHandler } from '../src/controllers/routeController'
import { computeRoute } from '../src/services/routeService'

// Mock dependencies
jest.mock('../src/services/routeService')
jest.mock('../src/utils/middleware', () => {
  const actual = jest.requireActual('../src/utils/middleware')

  class MockCustomError extends Error {
    public readonly statusCode: number
    public readonly isOperational: boolean = true

    constructor(message: string, statusCode: number) {
      super(message)
      this.statusCode = statusCode
      this.name = 'CustomError'
    }
  }

  return {
    ...actual,
    CustomError: MockCustomError,
    validateComputeRequest: jest.fn(),
  }
})

const mockComputeRoute = computeRoute as jest.MockedFunction<typeof computeRoute>
const { validateComputeRequest } = require('../src/utils/middleware')
const mockValidateComputeRequest = validateComputeRequest as jest.MockedFunction<
  typeof validateComputeRequest
>

describe('Route Controller', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockJson: jest.Mock
  let mockStatus: jest.Mock

  beforeEach(() => {
    mockJson = jest.fn().mockReturnThis()
    mockStatus = jest.fn().mockReturnThis()

    mockRequest = {
      body: { arrival: 'Endor' },
    }

    mockResponse = {
      status: mockStatus,
      json: mockJson,
    }

    // Reset all mocks
    jest.clearAllMocks()
  })

  describe('computeRouteHandler', () => {
    it('Given valid request body, When processing compute route, Then it should return 200 with result', () => {
      const mockResult = { duration: 8, route: ['Tatooine', 'Dagobah', 'Endor'] }
      mockValidateComputeRequest.mockReturnValue({ arrival: 'Endor' })
      mockComputeRoute.mockReturnValue(mockResult)

      computeRouteHandler(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(200)
    })

    it('Given valid request body, When processing compute route, Then it should call validateComputeRequest with correct parameters', () => {
      const mockResult = { duration: 8, route: ['Tatooine', 'Dagobah', 'Endor'] }
      mockValidateComputeRequest.mockReturnValue({ arrival: 'Endor' })
      mockComputeRoute.mockReturnValue(mockResult)

      computeRouteHandler(mockRequest as Request, mockResponse as Response)

      expect(mockValidateComputeRequest).toHaveBeenCalledWith({ arrival: 'Endor' })
    })

    it('Given valid request body, When processing compute route, Then it should call computeRoute with correct parameters', () => {
      const mockResult = { duration: 8, route: ['Tatooine', 'Dagobah', 'Endor'] }
      mockValidateComputeRequest.mockReturnValue({ arrival: 'Endor' })
      mockComputeRoute.mockReturnValue(mockResult)

      computeRouteHandler(mockRequest as Request, mockResponse as Response)

      expect(mockComputeRoute).toHaveBeenCalledWith('Endor')
    })

    it('Given valid request body, When processing compute route, Then it should return correct JSON response', () => {
      const mockResult = { duration: 8, route: ['Tatooine', 'Dagobah', 'Endor'] }
      mockValidateComputeRequest.mockReturnValue({ arrival: 'Endor' })
      mockComputeRoute.mockReturnValue(mockResult)

      computeRouteHandler(mockRequest as Request, mockResponse as Response)

      expect(mockJson).toHaveBeenCalledWith(mockResult)
    })

    it('Given CustomError with 400 status, When processing compute route, Then it should return 400 status', () => {
      const { CustomError } = require('../src/utils/middleware')
      const customError = new CustomError('Invalid request', 400)
      mockValidateComputeRequest.mockImplementation(() => {
        throw customError
      })

      computeRouteHandler(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(400)
    })

    it('Given CustomError with 400 status, When processing compute route, Then it should not call computeRoute', () => {
      const { CustomError } = require('../src/utils/middleware')
      const customError = new CustomError('Invalid request', 400)
      mockValidateComputeRequest.mockImplementation(() => {
        throw customError
      })

      computeRouteHandler(mockRequest as Request, mockResponse as Response)

      expect(mockComputeRoute).not.toHaveBeenCalled()
    })

    it('Given CustomError with 400 status, When processing compute route, Then it should return error JSON', () => {
      const { CustomError } = require('../src/utils/middleware')
      const customError = new CustomError('Invalid request', 400)
      mockValidateComputeRequest.mockImplementation(() => {
        throw customError
      })

      computeRouteHandler(mockRequest as Request, mockResponse as Response)

      expect(mockJson).toHaveBeenCalledWith({ error: { message: 'Invalid request' } })
    })

    it('Given CustomError with 404 status, When processing compute route, Then it should return 404 status', () => {
      const { CustomError } = require('../src/utils/middleware')
      const customError = new CustomError('Planet not found', 404)
      mockValidateComputeRequest.mockImplementation(() => {
        throw customError
      })

      computeRouteHandler(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(404)
    })

    it('Given CustomError with 404 status, When processing compute route, Then it should not call computeRoute', () => {
      const { CustomError } = require('../src/utils/middleware')
      const customError = new CustomError('Planet not found', 404)
      mockValidateComputeRequest.mockImplementation(() => {
        throw customError
      })

      computeRouteHandler(mockRequest as Request, mockResponse as Response)

      expect(mockComputeRoute).not.toHaveBeenCalled()
    })

    it('Given CustomError with 404 status, When processing compute route, Then it should return error JSON', () => {
      const { CustomError } = require('../src/utils/middleware')
      const customError = new CustomError('Planet not found', 404)
      mockValidateComputeRequest.mockImplementation(() => {
        throw customError
      })

      computeRouteHandler(mockRequest as Request, mockResponse as Response)

      expect(mockJson).toHaveBeenCalledWith({ error: { message: 'Planet not found' } })
    })

    it('Given CustomError with 500 status, When processing compute route, Then it should return 500 status', () => {
      const { CustomError } = require('../src/utils/middleware')
      const customError = new CustomError('Internal server error', 500)
      mockValidateComputeRequest.mockImplementation(() => {
        throw customError
      })

      computeRouteHandler(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(500)
    })

    it('Given CustomError with 500 status, When processing compute route, Then it should not call computeRoute', () => {
      const { CustomError } = require('../src/utils/middleware')
      const customError = new CustomError('Internal server error', 500)
      mockValidateComputeRequest.mockImplementation(() => {
        throw customError
      })

      computeRouteHandler(mockRequest as Request, mockResponse as Response)

      expect(mockComputeRoute).not.toHaveBeenCalled()
    })

    it('Given CustomError with 500 status, When processing compute route, Then it should return error JSON', () => {
      const { CustomError } = require('../src/utils/middleware')
      const customError = new CustomError('Internal server error', 500)
      mockValidateComputeRequest.mockImplementation(() => {
        throw customError
      })

      computeRouteHandler(mockRequest as Request, mockResponse as Response)

      expect(mockJson).toHaveBeenCalledWith({ error: { message: 'Internal server error' } })
    })

    it('Given Error with "No route found" message, When processing compute route, Then it should return 404 status', () => {
      const error = new Error('No route found from Tatooine to Coruscant')
      mockValidateComputeRequest.mockReturnValue({ arrival: 'Coruscant' })
      mockComputeRoute.mockImplementation(() => {
        throw error
      })

      computeRouteHandler(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(404)
    })

    it('Given Error with "No route found" message, When processing compute route, Then it should call computeRoute', () => {
      const error = new Error('No route found from Tatooine to Coruscant')
      mockValidateComputeRequest.mockReturnValue({ arrival: 'Coruscant' })
      mockComputeRoute.mockImplementation(() => {
        throw error
      })

      computeRouteHandler(mockRequest as Request, mockResponse as Response)

      expect(mockComputeRoute).toHaveBeenCalledWith('Coruscant')
    })

    it('Given Error with "No route found" message, When processing compute route, Then it should return error JSON', () => {
      const error = new Error('No route found from Tatooine to Coruscant')
      mockValidateComputeRequest.mockReturnValue({ arrival: 'Coruscant' })
      mockComputeRoute.mockImplementation(() => {
        throw error
      })

      computeRouteHandler(mockRequest as Request, mockResponse as Response)

      expect(mockJson).toHaveBeenCalledWith({
        error: { message: 'No route found from Tatooine to Coruscant' },
      })
    })

    it('Given Error with "No route found" message in different case, When processing compute route, Then it should return 500 status', () => {
      const error = new Error('NO ROUTE FOUND from Tatooine to Coruscant')
      mockValidateComputeRequest.mockReturnValue({ arrival: 'Coruscant' })
      mockComputeRoute.mockImplementation(() => {
        throw error
      })

      computeRouteHandler(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(500)
    })

    it('Given Error with "No route found" message in different case, When processing compute route, Then it should call computeRoute', () => {
      const error = new Error('NO ROUTE FOUND from Tatooine to Coruscant')
      mockValidateComputeRequest.mockReturnValue({ arrival: 'Coruscant' })
      mockComputeRoute.mockImplementation(() => {
        throw error
      })

      computeRouteHandler(mockRequest as Request, mockResponse as Response)

      expect(mockComputeRoute).toHaveBeenCalledWith('Coruscant')
    })

    it('Given Error with "No route found" message in different case, When processing compute route, Then it should return error JSON', () => {
      const error = new Error('NO ROUTE FOUND from Tatooine to Coruscant')
      mockValidateComputeRequest.mockReturnValue({ arrival: 'Coruscant' })
      mockComputeRoute.mockImplementation(() => {
        throw error
      })

      computeRouteHandler(mockRequest as Request, mockResponse as Response)

      expect(mockJson).toHaveBeenCalledWith({
        error: { message: 'NO ROUTE FOUND from Tatooine to Coruscant' },
      })
    })

    it('Given Error without "No route found" message, When processing compute route, Then it should return 500 status', () => {
      const error = new Error('Database connection failed')
      mockValidateComputeRequest.mockReturnValue({ arrival: 'Endor' })
      mockComputeRoute.mockImplementation(() => {
        throw error
      })

      computeRouteHandler(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(500)
    })

    it('Given Error without "No route found" message, When processing compute route, Then it should call computeRoute', () => {
      const error = new Error('Database connection failed')
      mockValidateComputeRequest.mockReturnValue({ arrival: 'Endor' })
      mockComputeRoute.mockImplementation(() => {
        throw error
      })

      computeRouteHandler(mockRequest as Request, mockResponse as Response)

      expect(mockComputeRoute).toHaveBeenCalledWith('Endor')
    })

    it('Given Error without "No route found" message, When processing compute route, Then it should return error JSON', () => {
      const error = new Error('Database connection failed')
      mockValidateComputeRequest.mockReturnValue({ arrival: 'Endor' })
      mockComputeRoute.mockImplementation(() => {
        throw error
      })

      computeRouteHandler(mockRequest as Request, mockResponse as Response)

      expect(mockJson).toHaveBeenCalledWith({ error: { message: 'Database connection failed' } })
    })

    it('Given non-Error object thrown, When processing compute route, Then it should return 500 with unknown error message', () => {
      const error = 'String error'
      mockValidateComputeRequest.mockReturnValue({ arrival: 'Endor' })
      mockComputeRoute.mockImplementation(() => {
        throw error
      })

      computeRouteHandler(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(500)
    })

    it('Given null error thrown, When processing compute route, Then it should return 500 with unknown error message', () => {
      const error = null
      mockValidateComputeRequest.mockReturnValue({ arrival: 'Endor' })
      mockComputeRoute.mockImplementation(() => {
        throw error
      })

      computeRouteHandler(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(500)
    })

    it('Given undefined error thrown, When processing compute route, Then it should return 500 with unknown error message', () => {
      const error = undefined
      mockValidateComputeRequest.mockReturnValue({ arrival: 'Endor' })
      mockComputeRoute.mockImplementation(() => {
        throw error
      })

      computeRouteHandler(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(500)
    })

    it('Given error thrown during validation, When processing compute route, Then it should not call computeRoute', () => {
      const error = new Error('Validation failed')
      mockValidateComputeRequest.mockImplementation(() => {
        throw error
      })

      computeRouteHandler(mockRequest as Request, mockResponse as Response)

      expect(mockComputeRoute).not.toHaveBeenCalled()
    })
  })
})
