import express from "express";
import cors from "cors";
import { config } from "./config/config.js";
import routes from "./routes/index.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();

  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json());

  app.use("/api", routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}