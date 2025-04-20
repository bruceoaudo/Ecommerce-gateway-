import { Request, Response, NextFunction } from "express";
import { authClient } from "../client/authClient";
import { UnauthorizedError } from "../errors/unauthorized-error";

interface VerifyTokenResponse {
  userId: string
  email: string
}

/**
 * Express middleware for JWT authentication
 * @throws {UnauthorizedError} When authentication fails
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Get token from cookies or Authorization header
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedError("Authentication required");
    }

    // 2. Verify token via gRPC with timeout
    const response = (await Promise.race([
      authClient.verifyToken({ token }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Verification timeout")), 5000)
      ),
    ])) as VerifyTokenResponse;

    // 3. Validate and attach user
    if (!response.userId) {
      throw new UnauthorizedError("Invalid token payload");
    }

    req.user = {
      userId: response.userId,
      email: response.email
    };

    // 4. Refresh token if expiring soon (optional)
    res.locals.shouldRefreshToken = true;

    next();
  } catch (error) {
    res.clearCookie("token");
    
    const message = error instanceof Error 
      ? error.message.replace(/^TOKEN_VERIFICATION_FAILED: /, '')
      : "Authentication failed";

    next(new UnauthorizedError(message));
  }
};