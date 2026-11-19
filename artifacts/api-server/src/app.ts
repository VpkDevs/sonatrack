import fs from "node:fs";
import path from "node:path";
import express, {
  type Express,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { buildDetailedHealth } from "./routes/health";
import { logger } from "./lib/logger";
import { loadServerConfig } from "./config";

export interface CreateAppOptions {
  corsOrigins?: string[] | true;
  staticDir?: string | null;
  enableLogging?: boolean;
  isProduction?: boolean;
}

export function createApp(options: CreateAppOptions = {}): Express {
  const config = loadServerConfig();
  const corsOrigins = options.corsOrigins ?? config.corsOrigins;
  const staticDir =
    options.staticDir !== undefined ? options.staticDir : config.staticDir;
  const enableLogging = options.enableLogging ?? true;
  const isProduction = options.isProduction ?? config.nodeEnv === "production";

  const app: Express = express();

  app.disable("x-powered-by");

  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=()",
    );
    next();
  });

  if (enableLogging) {
    app.use(
      pinoHttp({
        logger,
        serializers: {
          req(req) {
            return {
              id: req.id,
              method: req.method,
              url: req.url?.split("?")[0],
            };
          },
          res(res) {
            return {
              statusCode: res.statusCode,
            };
          },
        },
      }),
    );
  }

  app.use(cors({ origin: corsOrigins }));
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));

  app.get("/health", (_req, res) => {
    res.json(buildDetailedHealth());
  });

  app.use("/api", router);

  app.use("/api", (req, res) => {
    res.status(404).json({
      error: "NOT_FOUND",
      message: "API route not found",
      path: req.originalUrl,
    });
  });

  if (staticDir && fs.existsSync(path.join(staticDir, "index.html"))) {
    const indexHtmlPath = path.join(staticDir, "index.html");
    app.use(
      express.static(staticDir, {
        index: "index.html",
        maxAge: isProduction ? "1h" : 0,
      }),
    );

    app.use((req, res, next) => {
      if (req.method !== "GET" && req.method !== "HEAD") {
        next();
        return;
      }
      res.sendFile(indexHtmlPath);
    });
  }

  app.use((req, res) => {
    res.status(404).json({
      error: "NOT_FOUND",
      message: "Route not found",
      path: req.originalUrl,
    });
  });

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    logger.error({ err }, "Unhandled server error");
    if (res.headersSent) return;
    res.status(500).json({
      error: "INTERNAL_SERVER_ERROR",
      message: isProduction
        ? "An unexpected error occurred"
        : err instanceof Error
          ? err.message
          : "Unknown error",
    });
  });

  return app;
}

const app: Express = createApp();

export default app;
