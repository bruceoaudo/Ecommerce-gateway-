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
  /**
   * Client-side wrapper for user registration gRPC call.
   * @param {RegisterUserRequest} request - Registration request data.
   * @returns {Promise<RegisterUserResponse>} Resolves on success.
   * @throws {grpc.ServiceError} Rejects with gRPC error on failure.
   * @example
   * try {
   *   const response = await authClient.registerUser(request);
   * } catch (err) {
   *   console.error(err.message); // "Invalid email format"
   * }
   */
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

  /**
   * Client-side gRPC method for user login.
   * @description Authenticates a user via gRPC by validating credentials (email/password).
   *              Returns a Promise that resolves with login data or rejects with a gRPC error.
   *
   * @param {LoginUserRequest} request - The login request parameters.
   * @param {string} request.email - User's email address.
   * @param {string} request.password - User's plaintext password (will be hashed server-side).
   *
   * @returns {Promise<LoginUserResponse>} Resolves with:
   *   - `token`: JWT for authenticated sessions
   *   - `success`: boolean status
   *   - `message`: success/error message
   *   - `email`: authenticated user's email
   *
   * @throws {grpc.ServiceError} Rejects with gRPC errors including:
   *   - `INVALID_ARGUMENT` (3): Invalid email/password format
   *   - `INTERNAL` (13): Server error
   *
   * @example
   * // Successful login
   * try {
   *   const response = await authClient.loginUser({
   *     email: "user@example.com",
   *     password: "securePassword123!"
   *   });
   *   console.log(response.token); // JWT string
   * } catch (error) {
   *   if (isServiceError(error)) {
   *     console.error(`gRPC Error [${error.code}]: ${error.message}`);
   *   }
   * }
   *
   */
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

  /**
   * Verifies a JWT token via gRPC service
   * @param {VerifyTokenRequest} request - Contains the token to verify
   * @returns {Promise<VerifyTokenResponse>} Decoded token payload if valid
   * @throws {Object} gRPC error with { code, message } on failure
   */
  verifyToken: (request: VerifyTokenRequest): Promise<VerifyTokenResponse> => {
    return new Promise((resolve, reject) => {
      client.VerifyToken(
        request,
        (err: grpc.ServiceError | null, response?: VerifyTokenResponse) => {
          if (err) {
            console.error("Token verification failed:", err.message);
            reject(new Error(`TOKEN_VERIFICATION_FAILED: ${err.message}`));
          } else if (!response?.userId) {
            reject(new Error("INVALID_TOKEN_PAYLOAD"));
          } else {
            resolve(response);
          }
        }
      );
    });
  },
};