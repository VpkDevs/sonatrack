import { createApp } from "./app";
import { loadServerConfig } from "./config";
import { logger } from "./lib/logger";

const config = loadServerConfig();
const app = createApp({
  corsOrigins: config.corsOrigins,
  staticDir: config.staticDir,
  isProduction: config.nodeEnv === "production",
});

const server = app.listen(config.port, config.host, () => {
  logger.info(
    {
      host: config.host,
      port: config.port,
      nodeEnv: config.nodeEnv,
      servingStatic: Boolean(config.staticDir),
    },
    "Song Architect server listening",
  );
});

server.on("error", (err) => {
  logger.error({ err, host: config.host, port: config.port }, "Server listen error");
  process.exit(1);
});

let isShuttingDown = false;

function shutdown(signal: NodeJS.Signals) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info({ signal }, "Received shutdown signal; closing HTTP server");

  const forceTimer = setTimeout(() => {
    logger.error("Forced shutdown after graceful close timeout");
    process.exit(1);
  }, 10_000);
  forceTimer.unref();

  server.close((err) => {
    clearTimeout(forceTimer);
    if (err) {
      logger.error({ err }, "Error while closing HTTP server");
      process.exit(1);
    }
    logger.info("HTTP server closed cleanly");
    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
