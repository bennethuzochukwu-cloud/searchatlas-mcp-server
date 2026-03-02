/**
 * API client — generic JSON requests + SSE stream collector.
 * Mirrors the fetch patterns in lib/general-agent-api.ts and lib/streaming-utils.ts.
 */

import type { Config } from "../config.js";
import type { SSEChunk } from "../types/api.js";
import { getAuthHeaders } from "./auth.js";
import { ApiError, AuthError } from "./errors.js";
import { createSessionId, getUserId } from "./session.js";

// ─── JSON requests ──────────────────────────────────────────────────────────

export async function apiRequest<T>(
  config: Config,
  path: string,
  options: { method?: string; body?: unknown; params?: Record<string, string> } = {}
): Promise<T> {
  const url = new URL(`${config.apiUrl}${path}`);
  if (options.params) {
    for (const [k, v] of Object.entries(options.params)) {
      if (v !== undefined && v !== "") url.searchParams.set(k, v);
    }
  }

  const res = await fetch(url.toString(), {
    method: options.method ?? "GET",
    headers: getAuthHeaders(config),
    ...(options.body !== undefined && { body: JSON.stringify(options.body) }),
  });

  if (res.status === 401 || res.status === 403) {
    throw new AuthError();
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new ApiError(
      text || `${res.status} ${res.statusText}`,
      res.status,
      res.statusText
    );
  }

  // Handle 204 No Content
  if (res.status === 204) return undefined as T;

  return (await res.json()) as T;
}

// ─── SSE stream collector ───────────────────────────────────────────────────

/**
 * Sends a message to an agent endpoint via SSE and collects the full response.
 * SSE parsing mirrors frontend/lib/streaming-utils.ts:43-86.
 */
export async function streamAgentMessage(
  config: Config,
  endpoint: string,
  body: Record<string, unknown>
): Promise<string> {
  const url = `${config.apiUrl}${endpoint}`;

  const res = await fetch(url, {
    method: "POST",
    headers: getAuthHeaders(config),
    body: JSON.stringify({
      ...body,
      stream: true,
      session_id: body.session_id ?? createSessionId(),
      user_id: body.user_id ?? getUserId(config),
    }),
  });

  if (res.status === 401 || res.status === 403) {
    throw new AuthError();
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new ApiError(
      text || `${res.status} ${res.statusText}`,
      res.status,
      res.statusText
    );
  }

  if (!res.body) {
    throw new ApiError("Response body is empty", 500);
  }

  return collectSSEStream(res.body);
}

/** Read an SSE ReadableStream and return the concatenated content. */
async function collectSSEStream(body: ReadableStream<Uint8Array>): Promise<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let result = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Process complete SSE messages (delimited by double newline)
      const messages = buffer.split("\n\n");
      buffer = messages.pop() ?? "";

      for (const msg of messages) {
        const chunk = parseSSEChunk(msg);
        if (!chunk) continue;

        if (chunk.error) {
          throw new ApiError(chunk.error, 500);
        }

        if (typeof chunk.content === "string") {
          result += chunk.content;
        }

        if (chunk.is_complete) {
          return result;
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  return result;
}

function parseSSEChunk(line: string): SSEChunk | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith("data: ")) return null;

  try {
    return JSON.parse(trimmed.slice(6)) as SSEChunk;
  } catch {
    return null;
  }
}
