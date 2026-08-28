import "dotenv/config";

// Central place for reading env vars, with safe fallbacks for local dev.
// When Phase 3 adds MongoDB, add MONGO_URI here rather than scattering
// process.env reads through the codebase.
export const config = {
  port: process.env.PORT || 4000,
  jwtSecret: process.env.JWT_SECRET || "dev-secret-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  corsOrigin: (process.env.CORS_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim()),
};