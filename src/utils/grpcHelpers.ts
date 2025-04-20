import { status } from "@grpc/grpc-js"; // For gRPC status codes
import * as grpc from "@grpc/grpc-js";

/**
 * Type guard to check if an unknown error is a gRPC ServiceError.
 * @description Safely narrows the type of an error object to `grpc.ServiceError` by checking for required gRPC error properties.
 * @param {unknown} error - The error object to check (typically caught in a try/catch block).
 * @returns {error is grpc.ServiceError} `true` if the error matches the structure of a gRPC ServiceError, `false` otherwise.
 * @example
 * try {
 *   await someGrpcCall();
 * } catch (error) {
 *   if (isServiceError(error)) {
 *     console.log(error.code); // Safe to access gRPC error properties
 *   }
 * }
 */
export function isServiceError(error: unknown): error is grpc.ServiceError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "message" in error
  );
}

/**
 * Maps gRPC status codes to HTTP status codes.
 * @param {number} grpcCode - gRPC status code (e.g., `status.INVALID_ARGUMENT`).
 * @returns {number} Equivalent HTTP status code (e.g., `400`).
 * @example
 * const httpCode = mapGrpcToHttpStatus(status.INVALID_ARGUMENT); // 400
 */
export function mapGrpcToHttpStatus(grpcCode: number): number {
  switch (grpcCode) {
    case status.INVALID_ARGUMENT: // 3
      return 400; // Bad Request
    case status.ALREADY_EXISTS: // 6
      return 409; // Conflict
    case status.NOT_FOUND: // 5
      return 404; // Not Found
    case status.PERMISSION_DENIED: // 7
      return 403; // Forbidden
    case status.UNAUTHENTICATED: // 16
      return 401; // Unauthorized
    default:
      return 500; // Internal Server Error (fallback)
  }
}
