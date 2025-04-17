import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "path";

const PROTO_PATH = path.join(__dirname, "../../proto/users.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const proto = grpc.loadPackageDefinition(packageDefinition) as any;

const client = new proto.user.AuthService(
  "localhost:50051",
  grpc.credentials.createInsecure()
);

export interface RegisterUserRequest {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginUserRequest {
  email: string;
  password: string;
}

interface RegisterUserResponse {
  success: boolean;
  message: string;
}

interface LoginUserResponse {
  success: boolean;
  message: string;
  token: string;
  email: string;
}

interface VerifyTokenRequest {
  token: string
}

interface VerifyTokenResponse {
  userId: string;
  email: string;
}

export const authClient = {
  registerUser: (
    request: RegisterUserRequest
  ): Promise<RegisterUserResponse> => {
    return new Promise((resolve, reject) => {
      client.RegisterUser(
        request,
        (err: grpc.ServiceError | null, response?: RegisterUserResponse) => {
          if (err) reject(err);
          else resolve(response!);
        }
      );
    });
  },

  loginUser: (request: LoginUserRequest): Promise<LoginUserResponse> => {
    return new Promise((resolve, reject) => {
      client.LoginUser(
        request,
        (err: grpc.ServiceError | null, response?: LoginUserResponse) => {
          if (err) reject(err);
          else resolve(response!);
        }
      );
    });
  },

  verifyToken: (
    request: VerifyTokenRequest
  ): Promise<VerifyTokenResponse> => {
    return new Promise((resolve, reject) => {
      client.VerifyToken(
        request,
        (err: grpc.ServiceError | null, response?: VerifyTokenResponse) => {
          if (err) {
            console.error('Token verification failed:', err);
            reject({
              code: err.code,
              message: err.message
            });
          } else {
            resolve(response || { userId: '', email: '' });
          }
        }
      );
    });
  },
}