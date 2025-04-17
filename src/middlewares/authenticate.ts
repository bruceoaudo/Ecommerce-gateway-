import { Request, Response, NextFunction } from "express";
import { authClient } from "../client/authClient";
import { UnauthorizedError } from "../errors/unauthorized-error";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Get token from cookies
    const token = req.cookies?.token;
    if (!token) {
      throw new UnauthorizedError("Authentication token missing");
    }

    // 2. Verify token via gRPC
    const response = await authClient.verifyToken({ token });

    // 3. Attach user to request object
    req.user = {
      userId: response.userId,
      email: response.email,
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error);

    // Clear invalid token cookie
    res.clearCookie("token");

    if (error instanceof UnauthorizedError) {
      return next(error);
    }
    next(new UnauthorizedError("Invalid or expired token"));
  }
};
