import { Request, Response, Router } from "express";
import { productClient } from "../client/productClient";
import { authenticate } from "../middlewares/authenticate";
import * as grpc from "@grpc/grpc-js";

declare module "express" {
  interface Request {
    user?: {
      userId: string;
      email: string;
    };
  }
}

const router = Router()

router.get('/all-products', (req: Request, res: Response) => {
    (async () => {
        try {
          const response = await productClient.getAllProducts({});

          res.status(200).json({
            success: true,
            data: response.productItems,
            count: response.productItems.length,
          });
        } catch (error: any) {
          console.error("Product fetching error:", error);

          // Map gRPC error codes to HTTP status codes
          const statusMap: Record<number, number> = {
            [grpc.status.NOT_FOUND]: 404,
            [grpc.status.INVALID_ARGUMENT]: 400,
            [grpc.status.UNAUTHENTICATED]: 401,
            [grpc.status.PERMISSION_DENIED]: 403,
            [grpc.status.INTERNAL]: 500,
            [grpc.status.UNAVAILABLE]: 503,
          };

          const statusCode = statusMap[error.code] || 500;

          res.status(statusCode).json({
            success: false,
            message: error.message.split(".")[1] || "Failed to fetch products",
            code: error.code || "INTERNAL_ERROR",
          });
        }
    })()
})


export default router;