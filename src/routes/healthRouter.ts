import { Router } from 'express'

import { healthCheck, readinessCheck } from '../controllers/healthController'

export const createHealthRouter = (): Router => {
  const router = Router()

  // GET /health - Health check endpoint
  router.get('/health', healthCheck)

  // GET /ready - Readiness check endpoint
  router.get('/ready', readinessCheck)

  return router
}
