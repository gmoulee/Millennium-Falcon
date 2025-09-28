import compression from 'compression';
import cors from 'cors';
import express, { Application } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { createHealthRouter } from './routes/healthRouter';
import { createRouteRouter } from './routes/routeRouter';
import { requestLogger } from './utils/logger';
import { errorHandler, notFoundHandler } from './utils/middleware';

export const createApp = (): Application => {
  const app = express();

  // Security middleware
  app.use(helmet());

  // CORS configuration
  app.use(
    cors({
      origin:
        process.env['NODE_ENV'] === 'production'
          ? process.env['ALLOWED_ORIGINS']?.split(',') || false
          : true,
      credentials: true,
    })
  );

  // Compression middleware
  app.use(compression());

  // Logging middleware
  app.use(morgan(process.env['NODE_ENV'] === 'production' ? 'combined' : 'dev'));
  app.use(requestLogger);

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Health check endpoints
  app.use(createHealthRouter());

  // Route handlers
  app.use(createRouteRouter());

  // Error handling middleware (must be last)
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
