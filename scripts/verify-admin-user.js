#!/usr/bin/env node

/**
 * Script to verify the admin user exists and can authenticate
 * Usage: node scripts/verify-admin-user.js
 */

// @ts-nocheck


const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: ".env.local" });

// Environment validation function
function validateEnvironment() {
  const required = [
    "MONGODB_URI",
    "DATABASE_NAME",
    "ADMIN_EMAIL",
    "ADMIN_PASSWORD",
  ];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error("❌ Missing required environment variables:");
    missing.forEach((key) => console.error(`  • ${key}`));
    console.error("\n💡 Please check your .env.local file");
    process.exit(1);
  }

  // Validate MongoDB URI format
  const mongoUri = process.env.MONGODB_URI;
  if (
    !mongoUri.startsWith("mongodb://") &&
    !mongoUri.startsWith("mongodb+srv://")
  ) {
    console.error("❌ Invalid MONGODB_URI format");
    process.exit(1);
  }

  console.log("✅ Environment validation passed");
}

// User Schema (simplified version for this script)
const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error("Password comparison failed");
  }
};

const User = mongoose.model("User", UserSchema);

async function verifyAdminUser() {
  try {
    // Validate environment variables first
    validateEnvironment();

    console.log("🔌 Connecting to MongoDB...");

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DATABASE_NAME,
    });

    console.log("✅ Connected to MongoDB successfully");

    // Get admin credentials from environment variables (already validated)
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    console.log("🔍 Looking for admin user...");

    // Find the admin user
    const adminUser = await User.findOne({ email: adminEmail }).select(
      "+password"
    );

    if (!adminUser) {
      console.log("❌ Admin user not found!");
      return;
    }

    console.log("✅ Admin user found!");
    console.log("📧 Email:", adminUser.email);
    console.log("👤 Name:", adminUser.name);
    console.log("👑 Role:", adminUser.role);
    console.log("🟢 Active:", adminUser.isActive);
    console.log("📅 Created:", adminUser.createdAt);
    console.log("🆔 User ID:", adminUser._id);

    // Test password authentication
    console.log("🔐 Testing password authentication...");
    const isPasswordValid = await adminUser.comparePassword(adminPassword);

    if (isPasswordValid) {
      console.log("✅ Password authentication successful!");
    } else {
      console.log("❌ Password authentication failed!");
    }

    // Check admin privileges
    if (adminUser.role === "admin" && adminUser.isActive) {
      console.log("👑 ✅ User has admin privileges and is active");
    } else {
      console.log("❌ User does not have proper admin privileges");
    }

    // List all users for reference
    console.log("\n📋 All users in database:");
    const allUsers = await User.find({}, "email name role isActive createdAt");
    allUsers.forEach((user, index) => {
      console.log(
        `${index + 1}. ${user.email} - ${user.name} (${user.role}) - ${
          user.isActive ? "Active" : "Inactive"
        }`
      );
    });
  } catch (error) {
    console.error("❌ Error verifying admin user:", error.message);
    process.exit(1);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log("\n🔌 Database connection closed");
  }
}

// Run the script
if (require.main === module) {
  verifyAdminUser()
    .then(() => {
      console.log("🎉 Verification completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Verification failed:", error.message);
      process.exit(1);
    });
}

module.exports = { verifyAdminUser };
