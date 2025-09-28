import { Router } from 'express'

import { computeRouteHandler } from '../controllers/routeController'

export const createRouteRouter = (): Router => {
  const router = Router()

  // POST /compute - Compute optimal route
  router.post('/compute', computeRouteHandler)

  return router
}
