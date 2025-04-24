import { Request, Response, Router } from "express";
import { authClient, LoginUserRequest, RegisterUserRequest } from "../client/authClient";
import { isServiceError, mapGrpcToHttpStatus } from "../utils/grpcHelpers";
import * as grpc from "@grpc/grpc-js";

const router = Router()

/**
 * HTTP endpoint for user registration.
 * @description Forwards registration data to gRPC service and handles errors.
 * @route POST /register
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @returns {Response} JSON response with success/error message.
 * @throws {500} If an unknown server error occurs.
 * @example
 * // HTTP call example
 * fetch('/register', {
 *   method: 'POST',
 *   body: JSON.stringify({ email: 'test@example.com', ... })
 * });
 */
router.post('/register', (req: Request, res: Response) => {
    (async () => {
      try {
        const request: RegisterUserRequest = {
          fullName: req.body.fullName,
          phone: req.body.phone,
          email: req.body.email,
          password: req.body.password,
          confirmPassword: req.body.confirmPassword,
        };

        const response = await authClient.registerUser(request);

        res.status(201).json(response);
      } catch (error) {
        console.error("Registration error:", error);

        if (isServiceError(error)) {
          const grpcError = error as grpc.ServiceError;

          // Map gRPC status codes to HTTP status codes
          const httpStatus = mapGrpcToHttpStatus(grpcError.code);
          const errorMessage = grpcError.message || "Registration failed";

          res.status(httpStatus).json({
            success: false,
            message: errorMessage.split(":")[1], // Forward the gRPC error message
          });
        } else {
          // Unknown error (fallback)
          res.status(500).json({
            success: false,
            message: "Internal server error",
          });
        }
      
      }
})()
})

/**
 * Handles user login via HTTP, authenticates credentials via gRPC, and sets a secure session cookie.
 * @route POST /login
 * @description 
 *   - Validates email/password via gRPC service.
 *   - On success, sets an HTTP-only cookie with JWT token.
 *   - Maps gRPC errors to appropriate HTTP responses.
 * @group Authentication - Operations related to user authentication
 * @param {Request} req - Express request object. Expected body: { email: string, password: string }.
 * @param {Response} res - Express response object.
 * @returns {Response} JSON response with:
 *   - Success: User data + Set-Cookie header.
 *   - Error: gRPC error message with mapped HTTP status.
 * @throws {500} If an unexpected server error occurs.
 * @consumes application/json
 * @produces application/json
 * @example
 * // Request
 * POST /login
 * {
 *   "email": "user@example.com",
 *   "password": "securePassword123!"
 * }
 *
 * // Success Response (200)
 * Set-Cookie: userAuthToken=<JWT>; HttpOnly; Max-Age=86400; Path=/; SameSite=Strict
 * {
 *   "success": true,
 *   "message": "Login successful",
 *   "user": { "email": "user@example.com" }
 * }
 *
 * // Error Response (400)
 * {
 *   "success": false,
 *   "message": "Invalid credentials"
 * }
 */
router.post("/login", (req: Request, res: Response) => {
  (async () => {
    try {
      const request: LoginUserRequest = {
        email: req.body.email,
        password: req.body.password
      };

      const response = await authClient.loginUser(request);

      res.cookie("userAuthToken", response.token, {
        httpOnly: true, // Prevent XSS attacks
        secure: false, // HTTPS only in production
        sameSite: "strict", // Prevent CSRF attacks
        maxAge: 24 * 60 * 60 * 1000, // 1 day expiration in millisecs
        path: "/", // Available on all routes
        //domain: process.env.COOKIE_DOMAIN, // Set if using cross-domain cookies
      });

      res.status(200).json({
        success: response.success,
        message: response.message,
        user: {
          email: response.email,
        },
      });

    } catch (error) {
      console.error("Login error:", error);

      if (isServiceError(error)) {
        const grpcError = error as grpc.ServiceError;

        // Map gRPC status codes to HTTP status codes
        const httpStatus = mapGrpcToHttpStatus(grpcError.code);
        const errorMessage = grpcError.message || "Login failed";

        res.status(httpStatus).json({
          success: false,
          message: errorMessage.split(':')[1], // Forward the gRPC error message
        });
      } else {
        // Unknown error (fallback)
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    }
  })();
});

export default router;