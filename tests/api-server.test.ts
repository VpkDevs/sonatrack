import { describe, it, afterEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { createApp } from "../artifacts/api-server/src/app.ts";
import {
  parsePort,
  parseCorsOrigins,
  loadServerConfig,
} from "../artifacts/api-server/src/config.ts";

let activeServer: Server | null = null;
let tempDir: string | null = null;

async function startTestServer(
  options: Parameters<typeof createApp>[0],
): Promise<string> {
  const app = createApp({ enableLogging: false, ...options });
  return await new Promise((resolve, reject) => {
    const server = app.listen(0, "127.0.0.1", () => {
      activeServer = server;
      const addr = server.address() as AddressInfo;
      resolve(`http://127.0.0.1:${addr.port}`);
    });
    server.on("error", reject);
  });
}

afterEach(async () => {
  if (activeServer) {
    await new Promise<void>((resolve) => activeServer!.close(() => resolve()));
    activeServer = null;
  }
  if (tempDir) {
    fs.rmSync(tempDir, { recursive: true, force: true });
    tempDir = null;
  }
});

describe("api-server config validation", () => {
  it("defaults PORT to 8080 and HOST to 0.0.0.0 when unset", () => {
    const cfg = loadServerConfig({ SERVE_STATIC: "false" });
    assert.equal(cfg.port, 8080);
    assert.equal(cfg.host, "0.0.0.0");
    assert.equal(cfg.corsOrigins, true);
    assert.equal(cfg.staticDir, null);
  });

  it("rejects invalid PORT values cleanly", () => {
    assert.throws(() => parsePort("not-a-number"), /Invalid PORT/);
    assert.throws(() => parsePort("0"), /Invalid PORT/);
    assert.throws(() => parsePort("70000"), /Invalid PORT/);
    assert.equal(parsePort("3001"), 3001);
  });

  it("parses comma-separated CORS_ORIGIN allowlists", () => {
    assert.equal(parseCorsOrigins(undefined), true);
    assert.equal(parseCorsOrigins("*"), true);
    assert.deepEqual(
      parseCorsOrigins("https://sonatrack.app, https://preview.sonatrack.app"),
      ["https://sonatrack.app", "https://preview.sonatrack.app"],
    );
  });
});

describe("api-server HTTP endpoints and security headers", () => {
  it("serves /health, /api/health, and /api/healthz with security headers", async () => {
    const baseUrl = await startTestServer({ staticDir: null });

    const healthRes = await fetch(`${baseUrl}/health`);
    assert.equal(healthRes.status, 200);
    assert.equal(healthRes.headers.get("x-content-type-options"), "nosniff");
    assert.equal(healthRes.headers.get("x-frame-options"), "DENY");
    assert.equal(
      healthRes.headers.get("referrer-policy"),
      "strict-origin-when-cross-origin",
    );
    assert.equal(healthRes.headers.get("x-powered-by"), null);

    const healthBody = (await healthRes.json()) as {
      status: string;
      service: string;
      uptimeSeconds: number;
    };
    assert.equal(healthBody.status, "ok");
    assert.equal(healthBody.service, "sonatrack-api");
    assert.equal(typeof healthBody.uptimeSeconds, "number");

    const apiHealthRes = await fetch(`${baseUrl}/api/health`);
    assert.equal(apiHealthRes.status, 200);

    const healthzRes = await fetch(`${baseUrl}/api/healthz`);
    assert.equal(healthzRes.status, 200);
    assert.deepEqual(await healthzRes.json(), { status: "ok" });
  });

  it("returns structured JSON 404 for unknown API routes", async () => {
    const baseUrl = await startTestServer({ staticDir: null });
    const res = await fetch(`${baseUrl}/api/nonexistent`);
    assert.equal(res.status, 404);
    const body = (await res.json()) as { error: string; path: string };
    assert.equal(body.error, "NOT_FOUND");
    assert.equal(body.path, "/api/nonexistent");
  });

  it("serves built SPA static files with client-side fallback while keeping /api 404 JSON", async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "sonatrack-static-"));
    fs.writeFileSync(
      path.join(tempDir, "index.html"),
      "<!doctype html><html><body><div id=\"root\">Song Architect</div></body></html>",
    );

    const baseUrl = await startTestServer({ staticDir: tempDir });

    const rootRes = await fetch(`${baseUrl}/`);
    assert.equal(rootRes.status, 200);
    assert.match(await rootRes.text(), /Song Architect/);

    const spaRouteRes = await fetch(`${baseUrl}/chords`);
    assert.equal(spaRouteRes.status, 200);
    assert.match(await spaRouteRes.text(), /Song Architect/);

    const missingApiRes = await fetch(`${baseUrl}/api/missing`);
    assert.equal(missingApiRes.status, 404);
    const missingBody = (await missingApiRes.json()) as { error: string };
    assert.equal(missingBody.error, "NOT_FOUND");
  });
});
