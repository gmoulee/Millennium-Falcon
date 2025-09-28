export interface HealthCheckResponse {
  readonly status: 'healthy' | 'unhealthy'
  readonly timestamp: string
  readonly uptime: number
  readonly version: string
  readonly environment: string
  readonly memory: {
    readonly used: number
    readonly total: number
    readonly percentage: number
  }
  readonly database?: {
    readonly status: 'connected' | 'disconnected'
    readonly lastCheck: string
  }
  readonly ip?: string
  readonly userAgent?: string
}

export interface ReadinessCheckResponse {
  readonly status: 'ready' | 'not ready'
  readonly timestamp: string
  readonly database?: {
    readonly status: 'connected' | 'disconnected'
    readonly lastCheck: string
  }
}

export const getMemoryUsage = (): { used: number; total: number; percentage: number } => {
  const usage = process.memoryUsage()
  const total = usage.heapTotal
  const used = usage.heapUsed
  const percentage = Math.round((used / total) * 100)

  return { used, total, percentage }
}

export const getHealthStatus = (ip?: string, userAgent?: string): HealthCheckResponse => {
  const memoryUsage = getMemoryUsage()

  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env['npm_package_version'] || '1.0.0',
    environment: process.env['NODE_ENV'] || 'development',
    memory: memoryUsage,
    ...(ip && { ip }),
    ...(userAgent && { userAgent }),
  }
}

export const getReadinessStatus = (): ReadinessCheckResponse => {
  return {
    status: 'ready',
    timestamp: new Date().toISOString(),
  }
}
