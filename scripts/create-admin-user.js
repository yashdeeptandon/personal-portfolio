#!/usr/bin/env node

/**
 * Script to create an admin user in the database
 * Usage: node scripts/create-admin-user.js
 */

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

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error("Password comparison failed");
  }
};

const User = mongoose.model("User", UserSchema);

async function createAdminUser() {
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
    const adminName = process.env.ADMIN_NAME || "Admin User";

    // Admin user details
    const adminData = {
      email: adminEmail,
      password: adminPassword,
      name: adminName,
      role: "admin",
      isActive: true,
    };

    console.log("👤 Creating admin user...");

    // Check if user already exists
    const existingUser = await User.findOne({ email: adminData.email });

    if (existingUser) {
      console.log("⚠️  User already exists with email:", adminData.email);

      // Update existing user to admin if not already
      if (existingUser.role !== "admin") {
        existingUser.role = "admin";
        existingUser.isActive = true;
        existingUser.name = adminData.name;
        await existingUser.save();
        console.log("✅ Updated existing user to admin role");
      } else {
        console.log("ℹ️  User is already an admin");
      }
    } else {
      // Create new admin user
      const adminUser = new User(adminData);
      await adminUser.save();

      console.log("✅ Admin user created successfully!");
      console.log("📧 Email:", adminData.email);
      console.log("👑 Role:", adminData.role);
      console.log("🆔 User ID:", adminUser._id);
    }

    // Verify the user was created/updated correctly
    const verifyUser = await User.findOne({ email: adminData.email }).select(
      "+password"
    );
    if (verifyUser) {
      const isPasswordValid = await verifyUser.comparePassword(
        adminData.password
      );
      console.log(
        "🔐 Password verification:",
        isPasswordValid ? "✅ Valid" : "❌ Invalid"
      );
      console.log(
        "👑 Role verification:",
        verifyUser.role === "admin" ? "✅ Admin" : "❌ Not Admin"
      );
      console.log(
        "🟢 Active status:",
        verifyUser.isActive ? "✅ Active" : "❌ Inactive"
      );
    }
  } catch (error) {
    console.error("❌ Error creating admin user:", error.message);

    if (error.code === 11000) {
      console.error(
        "💡 This error usually means the email already exists in the database"
      );
    }

    process.exit(1);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
  }
}

// Run the script
if (require.main === module) {
  createAdminUser()
    .then(() => {
      console.log("🎉 Script completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Script failed:", error.message);
      process.exit(1);
    });
}

module.exports = { createAdminUser };
