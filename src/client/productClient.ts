import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "path";

const PROTO_PATH = path.join(__dirname, "../../proto/products.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const proto = grpc.loadPackageDefinition(packageDefinition) as any;

const client = new proto.product.ProductService(
  "localhost:50052",
  grpc.credentials.createInsecure()
);



interface GetAllProductsRequest {}

interface GetAllProductsResponse {
  productItems: ProductItem[]
}

interface ProductItem {
    name: string;
    price: number;
    category: string;
    imageURL: string;
    slug: string;
    description: string;
}

export const productClient = {
  getAllProducts: (
    request: GetAllProductsRequest
  ): Promise<GetAllProductsResponse> => {
    return new Promise((resolve, reject) => {
      client.GetAllProducts(
        request,
        (
          err: grpc.ServiceError | null,
          response?: GetAllProductsResponse
        ) => {
          if (err) {
            console.error("gRPC client error:", err);
            reject({
              code: err.code || grpc.status.INTERNAL,
              message: err.message || "Failed to fetch products",
            });
          } else {
            resolve(response!);
          }
        }
      );
    });
  },
};