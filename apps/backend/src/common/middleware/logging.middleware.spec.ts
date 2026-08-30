import { Logger } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { EventEmitter } from 'events';
import { LoggingMiddleware } from './logging.middleware';

describe('LoggingMiddleware', () => {
  let middleware: LoggingMiddleware;
  let loggerSpy: jest.SpyInstance;
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    middleware = new LoggingMiddleware();
    loggerSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should call next() and not log when NODE_ENV is test', () => {
    process.env.NODE_ENV = 'test';

    const req = {
      method: 'GET',
      originalUrl: '/api/vacancies',
    } as Request;

    const res = new EventEmitter() as unknown as Response;
    const next: NextFunction = jest.fn();

    middleware.use(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);

    // Emit finish event to verify no logging occurs
    res.emit('finish');
    expect(loggerSpy).not.toHaveBeenCalled();
  });

  it('should log request method, originalUrl, status code, and duration on finish in non-test env', () => {
    process.env.NODE_ENV = 'development';

    const req = {
      method: 'POST',
      originalUrl: '/auth/login',
    } as Request;

    const res = new EventEmitter() as unknown as Response & {
      statusCode: number;
    };
    res.statusCode = 200;

    const next: NextFunction = jest.fn();

    middleware.use(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);

    // Emit finish event
    res.emit('finish');

    expect(loggerSpy).toHaveBeenCalledTimes(1);
    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringMatching(/^POST \/auth\/login 200 \+\d+ms$/),
    );
  });

  it('should fallback to req.url if req.originalUrl is not present', () => {
    process.env.NODE_ENV = 'production';

    const req = {
      method: 'GET',
      url: '/health',
    } as Request;

    const res = new EventEmitter() as unknown as Response & {
      statusCode: number;
    };
    res.statusCode = 200;

    const next: NextFunction = jest.fn();

    middleware.use(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);

    res.emit('finish');

    expect(loggerSpy).toHaveBeenCalledTimes(1);
    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringMatching(/^GET \/health 200 \+\d+ms$/),
    );
  });
});
