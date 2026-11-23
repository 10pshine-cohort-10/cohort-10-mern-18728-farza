import { NextFunction, Request, Response } from "express";
import { logger } from "../config/logger";
import { AppError } from "../utils/AppError";

interface BodyParserError extends Error {
  status: number;
  type: string;
}

// Removes line breaks so a request path cannot fake extra log lines.
function sanitizeForLog(value: string): string {
  return value.replace(/[\r\n]/g, "");
}

function isBodyParserError(err: unknown): err is BodyParserError {
  return (
    err instanceof Error &&
    typeof (err as Partial<BodyParserError>).type === "string" &&
    typeof (err as Partial<BodyParserError>).status === "number"
  );
}

export function notFound(req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(`Route not found: ${req.method} ${sanitizeForLog(req.path)}`, 404));
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // req.path has no query string, so values like ?token=... are never logged.
  const requestInfo = { method: req.method, path: sanitizeForLog(req.path) };

  if (err instanceof AppError) {
    const log = err.statusCode >= 500 ? logger.error.bind(logger) : logger.warn.bind(logger);
    log({ ...requestInfo, statusCode: err.statusCode }, err.message);
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }

  if (isBodyParserError(err)) {
    // Log only safe metadata: the error object holds the raw request body.
    const message = err.status === 413 ? "Request body is too large" : "Invalid request body";
    logger.warn({ ...requestInfo, statusCode: err.status, errorType: err.type }, message);
    res.status(err.status).json({ success: false, message });
    return;
  }

  logger.error({ ...requestInfo, err }, "Unhandled error");
  res.status(500).json({ success: false, message: "Something went wrong" });
}