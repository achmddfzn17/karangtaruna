/**
 * File-based logger for runtime activity and errors.
 *
 * Writes plaintext lines to:
 *   logs/app-YYYY-MM-DD.log    (info, warn)
 *   logs/error-YYYY-MM-DD.log  (error)
 *
 * Designed for the Node.js runtime only (Auth.js, server actions, route handlers,
 * server components). Safe to import in edge code: `fs` is loaded lazily and any
 * write failure falls back to the standard console without throwing.
 */

import { mkdirSync, appendFileSync, existsSync } from "node:fs";
import path from "node:path";

type LogLevel = "info" | "warn" | "error";

const LOG_DIR = path.join(process.cwd(), "logs");
const IS_EDGE =
  typeof process !== "undefined" &&
  // @ts-expect-error - EdgeRuntime is injected at runtime, not in @types/node
  typeof EdgeRuntime !== "undefined";

let dirReady = false;
function ensureDir(): boolean {
  if (IS_EDGE) return false;
  if (dirReady) return true;
  try {
    if (!existsSync(LOG_DIR)) {
      mkdirSync(LOG_DIR, { recursive: true });
    }
    dirReady = true;
    return true;
  } catch {
    return false;
  }
}

function fileFor(level: LogLevel): string {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const base = level === "error" ? "error" : "app";
  return path.join(LOG_DIR, `${base}-${today}.log`);
}

function safeStringify(value: unknown): string {
  if (value instanceof Error) {
    return `${value.name}: ${value.message}${value.stack ? `\n${value.stack}` : ""}`;
  }
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function format(level: LogLevel, scope: string, message: string, meta?: unknown): string {
  const ts = new Date().toISOString();
  const head = `[${ts}] [${level.toUpperCase()}] [${scope}] ${message}`;
  return meta === undefined ? head : `${head} :: ${safeStringify(meta)}`;
}

function write(level: LogLevel, scope: string, message: string, meta?: unknown): void {
  const line = format(level, scope, message, meta);

  // Mirror to stdout/stderr so dev terminal still shows it.
  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }

  if (!ensureDir()) return;

  try {
    appendFileSync(fileFor(level), line + "\n", { encoding: "utf8" });
  } catch {
    // Swallow file errors — logging must never break the request.
  }
}

export const logger = {
  info(scope: string, message: string, meta?: unknown) {
    write("info", scope, message, meta);
  },
  warn(scope: string, message: string, meta?: unknown) {
    write("warn", scope, message, meta);
  },
  error(scope: string, message: string, meta?: unknown) {
    write("error", scope, message, meta);
  },
};

export type Logger = typeof logger;
