import mongoose from "mongoose";
import { config } from "./config.js";

export async function connectDB() {
  if (!config.mongoUri) {
    throw new Error("MONGO_URI is not set — cannot connect to MongoDB.");
  }

  try {
    await mongoose.connect(config.mongoUri);
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    throw err;
  }
}