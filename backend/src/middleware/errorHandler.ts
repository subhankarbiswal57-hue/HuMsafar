import { Request, Response, NextFunction } from "express";
import { logger } from "../config/logger";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction): void {
  const status = err instanceof ApiError ? err.status : err.status ?? 500;
  logger.error(err.message, { stack: err.stack, path: req.path });
  res.status(status).json({
    error: status === 500 ? "Internal server error" : err.message,
  });
}

export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
