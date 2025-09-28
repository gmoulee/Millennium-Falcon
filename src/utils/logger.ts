import { NextFunction, Request, Response } from 'express';

export interface LogEntry {
  readonly timestamp: string;
  readonly level: 'info' | 'warn' | 'error' | 'debug';
  readonly message: string;
  readonly metadata?: Record<string, unknown>;
}

export class Logger {
  private static instance: Logger;
  private readonly logLevel: string;

  private constructor() {
    this.logLevel = process.env['LOG_LEVEL'] || 'info';
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private shouldLog(level: string): boolean {
    const levels = ['error', 'warn', 'info', 'debug'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex <= currentLevelIndex;
  }

  private formatLog(level: string, message: string, metadata?: Record<string, unknown>): LogEntry {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: level as LogEntry['level'],
      message,
    };

    if (metadata) {
      return { ...logEntry, metadata };
    }

    return logEntry;
  }

  public info(message: string, metadata?: Record<string, unknown>): void {
    if (this.shouldLog('info')) {
      const logEntry = this.formatLog('info', message, metadata);
      console.log(JSON.stringify(logEntry));
    }
  }

  public warn(message: string, metadata?: Record<string, unknown>): void {
    if (this.shouldLog('warn')) {
      const logEntry = this.formatLog('warn', message, metadata);
      console.warn(JSON.stringify(logEntry));
    }
  }

  public error(message: string, metadata?: Record<string, unknown>): void {
    if (this.shouldLog('error')) {
      const logEntry = this.formatLog('error', message, metadata);
      console.error(JSON.stringify(logEntry));
    }
  }

  public debug(message: string, metadata?: Record<string, unknown>): void {
    if (this.shouldLog('debug')) {
      const logEntry = this.formatLog('debug', message, metadata);
      console.debug(JSON.stringify(logEntry));
    }
  }
}

export const logger = Logger.getInstance();

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
    };

    if (res.statusCode >= 400) {
      logger.warn('HTTP Request', logData);
    } else {
      logger.info('HTTP Request', logData);
    }
  });

  next();
};

export const errorLogger = (
  error: Error,
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const logData = {
    method: req.method,
    url: req.url,
    error: error.message,
    stack: error.stack,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  };

  logger.error('Request Error', logData);
  next(error);
};
