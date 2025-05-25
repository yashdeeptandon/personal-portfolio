import mongoose from "mongoose";
import {
  logDatabaseOperation,
  logError,
  logSuccess,
  logWarning,
} from "@/lib/utils/logger";
import { validateDatabaseConfig } from "@/lib/utils/env-validation";

interface ConnectionObject {
  isConnected?: number;
}

const connection: ConnectionObject = {};

async function dbConnect(): Promise<void> {
  const startTime = Date.now();

  // Validate database configuration before attempting connection
  const dbValidation = validateDatabaseConfig();
  if (!dbValidation.isValid) {
    const error = new Error(
      `Database configuration error: ${dbValidation.error}`
    );
    logError(error, {
      operation: "database_validation",
      error: dbValidation.error,
      uri: process.env.MONGODB_URI ? "configured" : "missing",
      database: process.env.DATABASE_NAME ? "configured" : "missing",
    });
    throw error;
  }

  // Check if we have a connection to the database or if it's currently connecting
  if (connection.isConnected) {
    logDatabaseOperation(
      "connection_check",
      "mongodb",
      Date.now() - startTime,
      {
        status: "already_connected",
        readyState: connection.isConnected,
      }
    );
    return;
  }

  try {
    logDatabaseOperation("connection_attempt", "mongodb", undefined, {
      uri: "configured", // We know it's configured due to validation above
      database: process.env.DATABASE_NAME!,
    });

    // Attempt to connect to the database
    const db = await mongoose.connect(process.env.MONGODB_URI!, {
      dbName: process.env.DATABASE_NAME!,
    });

    connection.isConnected = db.connections[0].readyState;
    const duration = Date.now() - startTime;

    logSuccess("MongoDB connection established", {
      duration,
      readyState: connection.isConnected,
      database: process.env.DATABASE_NAME!,
      host: db.connections[0].host,
      port: db.connections[0].port,
    });

    // Set up connection event listeners
    mongoose.connection.on("error", (error) => {
      logError(error, { type: "mongodb_error" });
    });

    mongoose.connection.on("disconnected", () => {
      logWarning("MongoDB disconnected", {
        readyState: mongoose.connection.readyState,
      });
      connection.isConnected = 0;
    });

    mongoose.connection.on("reconnected", () => {
      logSuccess("MongoDB reconnected", {
        readyState: mongoose.connection.readyState,
      });
      connection.isConnected = mongoose.connection.readyState;
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logError(error, {
      operation: "database_connection",
      duration,
      database: process.env.DATABASE_NAME!,
    });

    // Re-throw the error instead of process.exit to allow proper error handling
    throw error;
  }
}

export default dbConnect;
