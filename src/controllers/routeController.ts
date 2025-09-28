import { Request, Response } from 'express'

import { computeRoute } from '../services/routeService'
import { ComputeRequest } from '../types/routeTypes'
import { CustomError, validateComputeRequest } from '../utils/middleware'

export const computeRouteHandler = (req: Request, res: Response): void => {
  try {
    const requestBody = req.body as ComputeRequest

    const { arrival } = validateComputeRequest(requestBody)
    const result = computeRoute(arrival)

    res.status(200).json(result)
  } catch (error) {
    // If it's a CustomError, use its statusCode
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: { message: error.message } })
      return
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    if (errorMessage.includes('No route found')) {
      res.status(404).json({ error: { message: errorMessage } })
      return
    }

    res.status(500).json({ error: { message: errorMessage } })
  }
}
