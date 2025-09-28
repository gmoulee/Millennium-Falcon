import { Request, Response } from 'express';
import { getHealthStatus, getReadinessStatus } from '../services/healthService';
import { logger } from '../utils/logger';

export const healthCheck = async (req: Request, res: Response): Promise<void> => {
  try {
    const healthData = getHealthStatus(req.ip, req.get('User-Agent'));
    logger.info('Health check requested', { ip: req.ip, userAgent: req.get('User-Agent') });
    res.status(200).json(healthData);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Health check failed', { error: errorMessage });
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
    });
  }
};

export const readinessCheck = async (_req: Request, res: Response): Promise<void> => {
  try {
    const readinessData = getReadinessStatus();
    res.status(200).json(readinessData);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Readiness check failed', { error: errorMessage });
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      error: 'Service not ready',
    });
  }
};
