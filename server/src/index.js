import { createApp } from "./app.js";
import { config } from "./config/config.js";

const app = createApp();

app.listen(config.port, () => {
  console.log(`SyncBoard API listening on http://localhost:${config.port}`);
});