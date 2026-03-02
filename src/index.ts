#!/usr/bin/env node

/**
 * SearchAtlas MCP Server
 * Exposes SearchAtlas AI Agent tools over the Model Context Protocol (stdio transport).
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "./config.js";
import { registerAllTools } from "./tools/register-all.js";

const config = loadConfig();

const server = new McpServer({
  name: "searchatlas",
  version: "1.0.0",
});

registerAllTools(server, config);

const transport = new StdioServerTransport();
await server.connect(transport);
