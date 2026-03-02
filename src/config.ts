/**
 * Configuration — loads settings from environment variables.
 *
 * Auth priority:
 *   1. SEARCHATLAS_API_KEY  → sent as X-API-Key header
 *   2. SEARCHATLAS_TOKEN    → sent as Authorization: Bearer header
 */

export interface Config {
  apiUrl: string;
  apiKey?: string;
  token?: string;
}

export function loadConfig(): Config {
  const apiUrl =
    process.env.SEARCHATLAS_API_URL ?? "https://mcp.searchatlas.com";
  const apiKey = process.env.SEARCHATLAS_API_KEY;
  const token = process.env.SEARCHATLAS_TOKEN;

  if (!apiKey && !token) {
    throw new Error(
      "Missing credentials: set SEARCHATLAS_API_KEY or SEARCHATLAS_TOKEN environment variable."
    );
  }

  return { apiUrl: apiUrl.replace(/\/+$/, ""), apiKey, token };
}
