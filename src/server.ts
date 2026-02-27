import { Server } from "http";
import mongoose from "mongoose";
import { app } from "./app";
import { envVars } from "./app/config/env";

let server: Server;

const startServer = async () => {
  try {
    await mongoose.connect(envVars.DB_URL);

    server = app.listen(envVars.PORT, () => {
      console.log(`Server Runnig on port ${envVars.PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

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



//mistakely make a variable like that
process.on("unhandledRejection", (err) => {
  console.log("Unhandled Error Detected. Server Shutting Down...", err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});


//Forgot to handle local error
process.on("uncaughtException", (err) => {
  console.log("Uncaught Exception Detected. Server Shutting Down...", err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});


