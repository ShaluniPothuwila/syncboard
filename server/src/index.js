import http from "http";
import { createApp } from "./app.js";
import { config } from "./config/config.js";
import { connectDB } from "./config/db.js";
import { initIO } from "./realtime/io.js";

async function start() {
  await connectDB();

  const app = createApp();
  const httpServer = http.createServer(app);

  initIO(httpServer, config.corsOrigin);

  httpServer.listen(config.port, () => {
    console.log(`SyncBoard API listening on http://localhost:${config.port}`);
    console.log("WebSocket server ready for real-time board updates");
  });
}

start();