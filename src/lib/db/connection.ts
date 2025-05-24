import mongoose from "mongoose";
import {
  logDatabaseOperation,
  logError,
  logSuccess,
  logWarning,
} from "@/lib/utils/logger";

interface ConnectionObject {
  isConnected?: number;
}

const connection: ConnectionObject = {};

async function dbConnect(): Promise<void> {
  const startTime = Date.now();

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
      uri: process.env.MONGODB_URI ? "configured" : "missing",
      database: process.env.DATABASE_NAME || "portfolio",
    });

    // Attempt to connect to the database
    const db = await mongoose.connect(process.env.MONGODB_URI || "", {
      dbName: process.env.DATABASE_NAME || "portfolio",
    });

    connection.isConnected = db.connections[0].readyState;
    const duration = Date.now() - startTime;

    logSuccess("MongoDB connection established", {
      duration,
      readyState: connection.isConnected,
      database: process.env.DATABASE_NAME || "portfolio",
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
      uri: process.env.MONGODB_URI ? "configured" : "missing",
    });

    // Graceful exit in case of a connection error
    process.exit(1);
  }
}

export default dbConnect;
