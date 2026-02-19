import { Server } from "http";
import mongoose from "mongoose";
import { app } from "./app";
import { envVars } from "./app/config/env";

let server: Server | undefined;

const startServer = async () => {
  try {
    await mongoose.connect(envVars.DB_URL);
    console.log("Connected To DB");

    server = app.listen(envVars.PORT, () => {
      console.log(`Server Running on port ${envVars.PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

// Only start a long-running server when this file is executed directly (local dev).
if (require.main === module) {
  startServer();

  process.on("SIGTERM", () => {
    console.log("SIGTERM Detected. Server Shutting Down...");
    if (server) {
      server.close(() => {
        process.exit(1);
      });
    }
    process.exit(1);
  });

  process.on("SIGINT", () => {
    console.log("SIGINT Detected. Server Shutting Down...");
    if (server) {
      server.close(() => {
        process.exit(1);
      });
    }
    process.exit(1);
  });

  process.on("unhandledRejection", (err) => {
    console.log("Unhandled Error Detected. Server Shutting Down...", err);
    if (server) {
      server.close(() => {
        process.exit(1);
      });
    }
    process.exit(1);
  });

  process.on("uncaughtException", (err) => {
    console.log("Uncaught Exception Detected. Server Shutting Down...", err);
    if (server) {
      server.close(() => {
        process.exit(1);
      });
    }
    process.exit(1);
  });
}

// Export a handler compatible with Vercel's serverless functions.
// The `@vercel/node` builder accepts an exported function or an Express app.
export default async function handler(req: any, res: any) {
  if (mongoose.connection.readyState === 0) {
    try {
      await mongoose.connect(envVars.DB_URL);
      console.log("Connected To DB (handler)");
    } catch (err) {
      console.error("DB connection error in handler:", err);
      res.statusCode = 500;
      return res.end("Database connection error");
    }
  }

  return app(req, res);
}


// module.exports = app;/