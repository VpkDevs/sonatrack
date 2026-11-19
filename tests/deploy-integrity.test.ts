import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

describe("deployment configuration integrity", () => {
  it("pins packageManager and engines in root package.json", () => {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(rootDir, "package.json"), "utf8"),
    ) as {
      packageManager?: string;
      engines?: { node?: string; pnpm?: string };
      scripts?: Record<string, string>;
    };

    assert.match(pkg.packageManager ?? "", /^pnpm@10\./);
    assert.ok(pkg.engines?.node);
    assert.ok(pkg.scripts?.build);
    assert.ok(pkg.scripts?.typecheck);
    assert.ok(pkg.scripts?.test);
  });

  it("does not strip non-linux-x64 native binaries in pnpm-workspace.yaml", () => {
    const yaml = fs.readFileSync(
      path.join(rootDir, "pnpm-workspace.yaml"),
      "utf8",
    );
    assert.doesNotMatch(yaml, /@rollup\/rollup-.*:\s*["']-["']/);
    assert.doesNotMatch(yaml, /@esbuild\/.*:\s*["']-["']/);
    assert.doesNotMatch(yaml, /lightningcss-.*:\s*["']-["']/);
    assert.doesNotMatch(yaml, /@tailwindcss\/oxide-.*:\s*["']-["']/);
  });

  it("validates vercel.json SPA rewrite, build output, and security headers", () => {
    const vercel = JSON.parse(
      fs.readFileSync(path.join(rootDir, "vercel.json"), "utf8"),
    ) as {
      outputDirectory: string;
      rewrites: Array<{ source: string; destination: string }>;
      headers: Array<{ source: string; headers: Array<{ key: string; value: string }> }>;
    };

    assert.equal(vercel.outputDirectory, "artifacts/song-architect/dist/public");
    assert.ok(
      vercel.rewrites.some((r) => r.destination === "/index.html"),
    );

    const allHeaderKeys = vercel.headers.flatMap((h) =>
      h.headers.map((item) => item.key),
    );
    assert.ok(allHeaderKeys.includes("X-Content-Type-Options"));
    assert.ok(allHeaderKeys.includes("X-Frame-Options"));
    assert.ok(allHeaderKeys.includes("Referrer-Policy"));
  });

  it("validates netlify.toml, Dockerfile, render.yaml, and .env.example exist and cover key settings", () => {
    const netlify = fs.readFileSync(path.join(rootDir, "netlify.toml"), "utf8");
    assert.match(netlify, /artifacts\/song-architect\/dist\/public/);
    assert.match(netlify, /X-Content-Type-Options/);

    const dockerfile = fs.readFileSync(path.join(rootDir, "Dockerfile"), "utf8");
    assert.match(dockerfile, /AS builder/);
    assert.match(dockerfile, /AS runner/);
    assert.match(dockerfile, /HEALTHCHECK/);

    const render = fs.readFileSync(path.join(rootDir, "render.yaml"), "utf8");
    assert.match(render, /healthCheckPath:\s*\/health/);

    const envExample = fs.readFileSync(path.join(rootDir, ".env.example"), "utf8");
    for (const key of ["PORT", "HOST", "NODE_ENV", "LOG_LEVEL", "CORS_ORIGIN", "BASE_PATH"]) {
      assert.match(envExample, new RegExp(`^#?\\s*${key}=`, "m"));
    }
  });

  it("loads song-architect vite.config.ts without Replit env vars", async () => {
    const saved = {
      PORT: process.env.PORT,
      BASE_PATH: process.env.BASE_PATH,
      REPL_ID: process.env.REPL_ID,
      NODE_ENV: process.env.NODE_ENV,
    };

    delete process.env.PORT;
    delete process.env.BASE_PATH;
    delete process.env.REPL_ID;
    process.env.NODE_ENV = "production";

    try {
      const mod = await import(
        `../artifacts/song-architect/vite.config.ts?t=${Date.now()}`
      );
      const resolved =
        typeof mod.default === "function"
          ? await mod.default({ command: "build", mode: "production" })
          : mod.default;

      assert.equal(resolved.base, "/");
      assert.equal(resolved.server.port, 5173);
      assert.equal(resolved.server.host, "0.0.0.0");
    } finally {
      for (const [k, v] of Object.entries(saved)) {
        if (v === undefined) delete process.env[k];
        else process.env[k] = v;
      }
    }
  });
});
