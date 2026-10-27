import type { ErrorResponse } from "./types";

export type MockErrorStatus =
  | 400
  | 401
  | 403
  | 404
  | 410
  | 413
  | 409
  | 422
  | 429
  | 503;

export class MockApiError extends Error {
  readonly status: MockErrorStatus;
  readonly body: ErrorResponse;
  readonly retryAfterSeconds: number | null;

  constructor(
    status: MockErrorStatus,
    message: string,
    retryAfterSeconds: number | null = null,
  ) {
    super(message);
    this.name = "MockApiError";
    this.status = status;
    this.body = { error: message };
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export const mockError = {
  badRequest: (message = "invalid request") => new MockApiError(400, message),
  unauthorized: (message = "invalid credentials or expired session") =>
    new MockApiError(401, message),
  forbidden: (message = "required role is missing") =>
    new MockApiError(403, message),
  notFound: (message = "resource not found") => new MockApiError(404, message),
  conflict: (message = "resource conflict") => new MockApiError(409, message),
  invalidBody: (message = "invalid request body") =>
    new MockApiError(422, message),
  rateLimited: (message = "retry later", retryAfterSeconds = 1) =>
    new MockApiError(429, message, retryAfterSeconds),
  unavailable: (message = "service temporarily unavailable") =>
    new MockApiError(503, message),
};
