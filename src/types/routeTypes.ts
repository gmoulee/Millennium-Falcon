export interface MillenniumFalconConfig {
  readonly autonomy: number
  readonly departure: string
  readonly routesDb: string
}

export interface Route {
  readonly origin: string
  readonly destination: string
  readonly travelTime: number
}

export interface ComputeRequest {
  readonly arrival: string
}

export interface ComputeResponse {
  readonly duration: number
  readonly route: readonly string[]
}

export interface PathNode {
  readonly planet: string
  readonly totalDays: number
  readonly fuelRemaining: number
  readonly route: readonly string[]
}
