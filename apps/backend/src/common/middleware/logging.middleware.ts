import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    if (process.env.NODE_ENV === 'test') {
      return next();
    }

    const { method, originalUrl, url } = req;
    const path = originalUrl || url;
    const startTime = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - startTime;
      this.logger.log(`${method} ${path} ${statusCode} +${duration}ms`);
    });

    next();
  }
}
