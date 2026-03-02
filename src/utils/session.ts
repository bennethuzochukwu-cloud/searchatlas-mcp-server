/**
 * Session and user identity helpers.
 * Mirrors frontend/lib/jwt-utils.ts — generates session IDs and extracts
 * user_id from the JWT token so the backend can track conversations.
 */

import { randomUUID } from "node:crypto";
import type { Config } from "../config.js";

/**
 * Extract user_id from a JWT token payload.
 * Falls back to a stable random UUID when no token is available.
 */
export function getUserId(config: Config): string {
  if (config.token) {
    try {
      const parts = config.token.split(".");
      if (parts.length >= 2) {
        const payload = JSON.parse(
          Buffer.from(parts[1], "base64url").toString()
        );
        const rawId: string | undefined = payload.user_id ?? payload.sub;
        if (rawId) return String(rawId).replace(/\W+/g, "_");
      }
    } catch {
      // Malformed token — fall through to random ID
    }
  }
  return getMcpUserId();
}

/** Stable per-process user ID fallback (used when no JWT is available). */
let _mcpUserId: string | undefined;
function getMcpUserId(): string {
  if (!_mcpUserId) _mcpUserId = `mcp_${randomUUID().replace(/-/g, "")}`;
  return _mcpUserId;
}

/** Generate a new session ID (one per tool call). */
export function createSessionId(): string {
  return randomUUID();
}
