import { defineConfig, type PluginOption } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { mockupPreviewPlugin } from "./mockupPreviewPlugin";

function parsePort(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 65535) {
    throw new Error(`Invalid PORT value: "${raw}". Expected an integer between 1 and 65535.`);
  }
  return parsed;
}

function normalizeBasePath(raw: string | undefined): string {
  const value = (raw ?? "/__mockup").trim();
  if (!value || value === "/") return "/";
  const withLeading = value.startsWith("/") ? value : `/${value}`;
  return withLeading.endsWith("/") ? withLeading : `${withLeading}/`;
}

const port = parsePort(process.env.PORT, 8081);
const basePath = normalizeBasePath(process.env.BASE_PATH);
const isReplitDev =
  process.env.NODE_ENV !== "production" && Boolean(process.env.REPL_ID);

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

  return plugins;
}

const replitPlugins = await loadReplitPlugins();

export default defineConfig({
  base: basePath,
  plugins: [
    mockupPreviewPlugin(),
    react(),
    tailwindcss(),
    ...replitPlugins,
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
  },
  server: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
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
