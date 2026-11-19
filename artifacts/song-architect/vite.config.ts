import { defineConfig, type PluginOption } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

function parsePort(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 65535) {
    throw new Error(`Invalid PORT value: "${raw}". Expected an integer between 1 and 65535.`);
  }
  return parsed;
}

function normalizeBasePath(raw: string | undefined): string {
  const value = (raw ?? "/").trim();
  if (!value || value === "/") return "/";
  const withLeading = value.startsWith("/") ? value : `/${value}`;
  return withLeading.endsWith("/") ? withLeading : `${withLeading}/`;
}

const port = parsePort(process.env.PORT, 5173);
const basePath = normalizeBasePath(process.env.VITE_BASE_PATH ?? process.env.BASE_PATH);
const isReplitDev =
  process.env.NODE_ENV !== "production" && Boolean(process.env.REPL_ID);
const apiProxyTarget = process.env.VITE_API_PROXY_TARGET ?? "http://127.0.0.1:8080";

async function loadReplitPlugins(): Promise<PluginOption[]> {
  if (!isReplitDev) return [];

  const plugins: PluginOption[] = [];

  try {
    const runtimeErrorOverlay = await import(
      "@replit/vite-plugin-runtime-error-modal"
    );
    plugins.push(runtimeErrorOverlay.default());
  } catch {
    // Optional Replit dev plugin not installed
  }

  try {
    const cartographer = await import("@replit/vite-plugin-cartographer");
    plugins.push(
      cartographer.cartographer({
        root: path.resolve(import.meta.dirname, ".."),
      }),
    );
  } catch {
    // Optional Replit dev plugin not installed
  }

  try {
    const devBanner = await import("@replit/vite-plugin-dev-banner");
    plugins.push(devBanner.devBanner());
  } catch {
    // Optional Replit dev plugin not installed
  }

  return plugins;
}

const replitPlugins = await loadReplitPlugins();

export default defineConfig({
  base: basePath,
  plugins: [react(), tailwindcss(), ...replitPlugins],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: Boolean(process.env.REPL_ID),
    host: "0.0.0.0",
    allowedHosts: true,
    proxy: {
      "/api": {
        target: apiProxyTarget,
        changeOrigin: true,
      },
    },
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
