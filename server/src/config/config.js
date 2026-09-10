import "dotenv/config";

const DEV_JWT_SECRET = "dev-secret-change-me";
const isProduction = process.env.NODE_ENV === "production";

// The dev fallback is committed to the repo, so anything signed with it can be
// forged by anyone who can read the source. Refuse to start a production
// process without a real secret rather than silently issuing forgeable tokens.
if (isProduction && !process.env.JWT_SECRET) {
  throw new Error(
    "JWT_SECRET must be set when NODE_ENV=production — refusing to start with the " +
    "public development fallback, which would let anyone forge a login token."
  );
}

if (!process.env.JWT_SECRET) {
  console.warn(
    `[config] JWT_SECRET is not set; using the development fallback "${DEV_JWT_SECRET}". ` +
    "Never run a deployed service this way."
  );
}

export const config = {
  port: process.env.PORT || 4000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET || DEV_JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  corsOrigin: (process.env.CORS_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim()),
};
