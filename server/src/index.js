import { createApp } from "./app.js";
import { config } from "./config/config.js";
import { connectDB } from "./config/db.js";

async function start() {
  await connectDB();

  const app = createApp();
  app.listen(config.port, () => {
    console.log(`SyncBoard API listening on http://localhost:${config.port}`);
  });
}

start();