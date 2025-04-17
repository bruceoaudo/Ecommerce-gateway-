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


export interface GetAllCategoriesRequest{ }

interface categoryItem {
    id: string
    name: string
}

export interface GetAllCategoriesResponse {
    categoryItems: categoryItem[]
}

interface SaveUserCategoryPreferencesRequest {
    userId: string;
    categoryIds: string[];
}

interface SaveUserCategoryPreferencesResponse {
    status: boolean;
    message: string;
}

interface GetAllProductsFromCategoriesUserPrefersRequest {
    userId: string;
}

interface GetAllProductsFromCategoriesUserPrefersResponse {
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
  getAllCategories: (
    request: GetAllCategoriesRequest
  ): Promise<GetAllCategoriesResponse> => {
    return new Promise((resolve, reject) => {
      client.GetAllCategories(
        request,
        (
          err: grpc.ServiceError | null,
          response?: GetAllCategoriesResponse
        ) => {
          if (err) reject(err);
          else resolve(response!);
        }
      );
    });
  },

  SaveUserCategoryPreferences: (
    request: SaveUserCategoryPreferencesRequest
  ): Promise<SaveUserCategoryPreferencesResponse> => {
    return new Promise((resolve, reject) => {
      client.SaveUserCategoryPreferences(
        {
          user_id: request.userId,
          category_ids: request.categoryIds,
        },
        (
          err: grpc.ServiceError | null,
          response?: SaveUserCategoryPreferencesResponse
        ) => {
          if (err) reject(err);
          else resolve(response!);
        }
      );
    });
  },

  GetAllProductsFromCategoriesUserPrefers: (
    request: GetAllProductsFromCategoriesUserPrefersRequest
  ): Promise<GetAllProductsFromCategoriesUserPrefersResponse> => {
    return new Promise((resolve, reject) => {
      client.SaveUserCategoryPreferences(
        {
          user_id: request.userId,
        },
        (
          err: grpc.ServiceError | null,
          response?: GetAllProductsFromCategoriesUserPrefersResponse
        ) => {
          if (err) reject(err);
          else resolve(response!);
        }
      );
    });
  },
};