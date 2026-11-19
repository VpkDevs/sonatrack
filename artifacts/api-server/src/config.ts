import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

export interface ServerConfig {
  port: number;
  host: string;
  nodeEnv: string;
  corsOrigins: string[] | true;
  staticDir: string | null;
}

export function parsePort(raw: string | undefined, fallback = 8080): number {
  if (raw === undefined || raw.trim() === "") {
    return fallback;
  }
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 65535) {
    throw new Error(
      `Invalid PORT value: "${raw}". Expected an integer between 1 and 65535.`,
    );
  }
  return parsed;
}

export function parseCorsOrigins(raw: string | undefined): string[] | true {
  if (!raw || raw.trim() === "" || raw.trim() === "*") {
    return true;
  }
  const origins = raw
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
  return origins.length > 0 ? origins : true;
}

export function resolveStaticDir(
  env: NodeJS.ProcessEnv = process.env,
): string | null {
  if (env.SERVE_STATIC === "false") {
    return null;
  }

  const candidates = [
    env.STATIC_DIR ? path.resolve(env.STATIC_DIR) : null,
    path.resolve(process.cwd(), "public"),
    path.resolve(process.cwd(), "artifacts/song-architect/dist/public"),
    path.resolve(currentDir, "../../song-architect/dist/public"),
  ].filter((candidate): candidate is string => Boolean(candidate));

  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, "index.html"))) {
      return dir;
    }
  }

  return null;
}

export function loadServerConfig(
  env: NodeJS.ProcessEnv = process.env,
): ServerConfig {
  return {
    port: parsePort(env.PORT, 8080),
    host: env.HOST?.trim() || "0.0.0.0",
    nodeEnv: env.NODE_ENV ?? "development",
    corsOrigins: parseCorsOrigins(env.CORS_ORIGIN),
    staticDir: resolveStaticDir(env),
  };
}
