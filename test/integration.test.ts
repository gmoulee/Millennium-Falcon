import request from 'supertest'
import { createApp } from '../src/app'
import { initializeConfig, loadConfig } from '../src/utils/config'
import { loadRoutes } from '../src/utils/routeCache'

describe('API Integration Tests', () => {
  let app: any

  beforeAll(async () => {
    // Initialize config and cache for tests
    const config = loadConfig('./config/millennium-falcon.json')
    initializeConfig(config)
    await loadRoutes(config)

    app = createApp()
  })

  describe('POST /compute', () => {
    it('Given valid request body, When posting to /compute, Then it should return 200 status', async () => {
      const requestBody = { arrival: 'Endor' }

      const response = await request(app).post('/compute').send(requestBody)

      expect(response.status).toBe(200)
    })

    it('Given valid request body, When posting to /compute, Then it should return response with duration property', async () => {
      const requestBody = { arrival: 'Endor' }

      const response = await request(app).post('/compute').send(requestBody)

      expect(response.body).toHaveProperty('duration')
    })

    it('Given valid request body, When posting to /compute, Then it should return response with route property', async () => {
      const requestBody = { arrival: 'Endor' }

      const response = await request(app).post('/compute').send(requestBody)

      expect(response.body).toHaveProperty('route')
    })

    it('Given valid request body, When posting to /compute, Then it should return route as array', async () => {
      const requestBody = { arrival: 'Endor' }

      const response = await request(app).post('/compute').send(requestBody)

      expect(response.body.route).toBeInstanceOf(Array)
    })

    it('Given valid request body, When posting to /compute, Then it should start route with departure planet', async () => {
      const requestBody = { arrival: 'Endor' }

      const response = await request(app).post('/compute').send(requestBody)

      expect(response.body.route[0]).toBe('Tatooine')
    })

    it('Given valid request body, When posting to /compute, Then it should end route with arrival planet', async () => {
      const requestBody = { arrival: 'Endor' }

      const response = await request(app).post('/compute').send(requestBody)

      expect(response.body.route[response.body.route.length - 1]).toBe('Endor')
    })

    it('Given same departure and arrival planet, When posting to /compute, Then it should return zero duration', async () => {
      const requestBody = { arrival: 'Tatooine' }

      const response = await request(app).post('/compute').send(requestBody)

      expect(response.body.duration).toBe(0)
    })

    it('Given same departure and arrival planet, When posting to /compute, Then it should return single planet route', async () => {
      const requestBody = { arrival: 'Tatooine' }

      const response = await request(app).post('/compute').send(requestBody)

      expect(response.body.route).toEqual(['Tatooine'])
    })

    it('Given invalid planet in request, When posting to /compute, Then it should return 404', async () => {
      const requestBody = { arrival: 'Coruscant' }

      const response = await request(app).post('/compute').send(requestBody)

      expect(response.status).toBe(404)
    })

    it('Given invalid planet in request, When posting to /compute, Then it should return error message', async () => {
      const requestBody = { arrival: 'Coruscant' }

      const response = await request(app).post('/compute').send(requestBody)

      expect(response.body.error).toBeDefined()
    })

    it('Given invalid planet in request, When posting to /compute, Then it should return specific error message', async () => {
      const requestBody = { arrival: 'Coruscant' }

      const response = await request(app).post('/compute').send(requestBody)

      expect(response.body.error.message).toContain('not found in available routes')
    })

    it('Given missing arrival field, When posting to /compute, Then it should return 400', async () => {
      const requestBody = {}

      const response = await request(app).post('/compute').send(requestBody)

      expect(response.status).toBe(400)
    })

    it('Given missing arrival field, When posting to /compute, Then it should return error message', async () => {
      const requestBody = {}

      const response = await request(app).post('/compute').send(requestBody)

      expect(response.body.error).toBeDefined()
    })

    it('Given missing arrival field, When posting to /compute, Then it should return specific error message', async () => {
      const requestBody = {}

      const response = await request(app).post('/compute').send(requestBody)

      expect(response.body.error.message).toContain('Missing or invalid arrival field')
    })

    it('Given empty arrival field, When posting to /compute, Then it should return 400', async () => {
      const requestBody = { arrival: '' }

      const response = await request(app).post('/compute').send(requestBody)

      expect(response.status).toBe(400)
    })

    it('Given empty arrival field, When posting to /compute, Then it should return error message', async () => {
      const requestBody = { arrival: '' }

      const response = await request(app).post('/compute').send(requestBody)

      expect(response.body.error).toBeDefined()
    })

    it('Given empty arrival field, When posting to /compute, Then it should return specific error message', async () => {
      const requestBody = { arrival: '' }

      const response = await request(app).post('/compute').send(requestBody)

      expect(response.body.error.message).toContain('Missing or invalid arrival field')
    })

    it('Given invalid request body, When posting to /compute, Then it should return 400', async () => {
      const requestBody = 'invalid json'

      const response = await request(app).post('/compute').send(requestBody)

      expect(response.status).toBe(400)
    })

    it('Given invalid request body, When posting to /compute, Then it should return error message', async () => {
      const requestBody = 'invalid json'

      const response = await request(app).post('/compute').send(requestBody)

      expect(response.body.error).toBeDefined()
    })
  })

  describe('GET /health', () => {
    it('Given health endpoint, When making GET request, Then it should return 200 status', async () => {
      const endpoint = '/health'

      const response = await request(app).get(endpoint)

      expect(response.status).toBe(200)
    })

    it('Given health endpoint, When making GET request, Then it should return healthy status', async () => {
      const endpoint = '/health'

      const response = await request(app).get(endpoint)

      expect(response.body).toHaveProperty('status', 'healthy')
    })

    it('Given health endpoint, When making GET request, Then it should return timestamp property', async () => {
      const endpoint = '/health'

      const response = await request(app).get(endpoint)

      expect(response.body).toHaveProperty('timestamp')
    })

    it('Given health endpoint, When making GET request, Then it should return uptime property', async () => {
      const endpoint = '/health'

      const response = await request(app).get(endpoint)

      expect(response.body).toHaveProperty('uptime')
    })
  })

  describe('404 handling', () => {
    it('Given non-existing endpoint, When making GET request, Then it should return 404', async () => {
      const endpoint = '/non-existing'

      const response = await request(app).get(endpoint)

      expect(response.status).toBe(404)
    })

    it('Given non-existing endpoint, When making GET request, Then it should return error message', async () => {
      const endpoint = '/non-existing'

      const response = await request(app).get(endpoint)

      expect(response.body.error).toBeDefined()
    })

    it('Given non-existing endpoint, When making GET request, Then it should return specific error message', async () => {
      const endpoint = '/non-existing'

      const response = await request(app).get(endpoint)

      expect(response.body.error.message).toContain('Route GET /non-existing not found')
    })
  })
})
