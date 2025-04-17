import express from "express"
import cors from "cors"
import dotenv from 'dotenv'
import authRouter from './routes/auth.routes'
import productRouter from './routes/products.routes'
import cookieParser from "cookie-parser";

const app = express()
app.use(express.json())
app.use(cookieParser())
dotenv.config()
const port = process.env.PORT || 6000
const domain = process.env.DOMAIN

const corsConfig = {
  origin: [
    "*"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "X-GRPC-WEB", // Important for gRPC-Web
    "grpc-timeout", // gRPC specific headers
    "X-User-Agent",
    "X-GRPC-Web",
  ],
  exposedHeaders: [
    "Grpc-Status", // gRPC specific headers
    "Grpc-Message",
    "Grpc-Status-Details-Bin",
    "Authorization",
  ],
  credentials: true, // Allow cookies/auth headers
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsConfig))

// Routes
app.use('/api/v1/auth', authRouter)
app.use('api/v1/products', productRouter)


// Start the server
const server = app.listen(port, () => console.log(`Server started on: http://${domain}:${port}`))

// Graceful shutdown handlers
process.on("SIGINT", () => {
  console.log("SIGINT received. Shutting down gracefully...");
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
});

// Error handlers
["uncaughtException", "unhandledRejection"].forEach((event) => {
  process.on(event, (error) => {
    console.error(`${event}:`, error);
  });
});