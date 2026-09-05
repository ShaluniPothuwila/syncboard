import mongoose from "mongoose";
import { config } from "./config.js";

export async function connectDB() {
  if (!config.mongoUri) {
    console.error("MONGO_URI is not set in .env — cannot connect to MongoDB.");
    process.exit(1);
  }

  try {
    await mongoose.connect(config.mongoUri);
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
}