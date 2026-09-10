import { createApp } from "../server/src/app.js";
import { connectDB } from "../server/src/config/db.js";

const app = createApp();

export default async function handler(req, res) {
  await connectDB();
  return app(req, res);
}