# SearchAtlas MCP Server

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server that connects any MCP-compatible client to the SearchAtlas AI Agent platform — giving Claude Desktop, Cursor, Zed, Claude Code, and other AI tools access to 10 specialized SEO/marketing agents, project management, playbook automation, and more.

## Getting an API Key

1. Sign up at [searchatlas.com](https://searchatlas.com)
2. Navigate to **Settings > API Keys** to generate your `SEARCHATLAS_API_KEY`
3. Alternatively, use your JWT session token (`SEARCHATLAS_TOKEN`) from the app — open browser DevTools console and run `localStorage.getItem('token')`

## Quick Start

### Option 1: Install globally via npm

```bash
npm install -g searchatlas-mcp-server
```

Then run:

```bash
SEARCHATLAS_API_KEY=your-key searchatlas-mcp-server
```

### Option 2: Run directly with npx (no install)

```bash
SEARCHATLAS_API_KEY=your-key npx searchatlas-mcp-server
```

### Option 3: Run from source (local development)

```bash
git clone https://gitlab.com/LinkLabs/searchatlas-mcp-server.git
cd searchatlas-mcp-server
npm install
npm run build
SEARCHATLAS_API_KEY=your-key node dist/index.js
```

### Option 4: Docker

```bash
docker build -t searchatlas-mcp-server .
docker run -e SEARCHATLAS_API_KEY=your-key searchatlas-mcp-server
```

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SEARCHATLAS_API_KEY` | One of these | API key (sent as `X-API-Key` header) |
| `SEARCHATLAS_TOKEN` | is required | JWT token (sent as `Authorization: Bearer` header) |
| `SEARCHATLAS_API_URL` | No | API base URL (default: `https://mcp.searchatlas.com`) |

> **Note:** You must provide either `SEARCHATLAS_API_KEY` or `SEARCHATLAS_TOKEN`. The server will not start without credentials.

## Client Setup

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "searchatlas": {
      "command": "npx",
      "args": ["-y", "searchatlas-mcp-server"],
      "env": {
        "SEARCHATLAS_API_KEY": "your-api-key"
      }
    }
  }
}
```

### Cursor

Add to `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "searchatlas": {
      "command": "npx",
      "args": ["-y", "searchatlas-mcp-server"],
      "env": {
        "SEARCHATLAS_API_KEY": "your-api-key"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add searchatlas --env SEARCHATLAS_API_KEY=your-api-key -- npx -y searchatlas-mcp-server
```

### Zed

Add to Zed settings (`settings.json`):

```json
{
  "context_servers": {
    "searchatlas": {
      "command": {
        "path": "npx",
        "args": ["-y", "searchatlas-mcp-server"],
        "env": {
          "SEARCHATLAS_API_KEY": "your-api-key"
        }
      }
    }
  }
}
```

### Windsurf

Add to `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "searchatlas": {
      "command": "npx",
      "args": ["-y", "searchatlas-mcp-server"],
      "env": {
        "SEARCHATLAS_API_KEY": "your-api-key"
      }
    }
  }
}
```

## Tools

### Agent Tools (10)

Each agent tool accepts a `message` (required), plus optional `project_id`, `playbook_id`, and `plan_mode` parameters.

| Tool | Agent | Description |
|------|-------|-------------|
| `searchatlas_orchestrator` | Orchestrator | Multi-agent coordinator — routes queries to the best specialist |
| `searchatlas_otto_seo` | OTTO SEO | On-page SEO automation — technical fixes, schema, optimizations |
| `searchatlas_ppc` | PPC | Google Ads management — campaigns, bids, performance analysis |
| `searchatlas_content` | Content Genius | AI content generation — blogs, landing pages, optimized copy |
| `searchatlas_site_explorer` | Site Explorer | Site audit — crawl data, backlinks, competitive intelligence |
| `searchatlas_gbp` | GBP | Google Business Profile — listings, reviews, local SEO |
| `searchatlas_authority_building` | Authority | Link building and digital PR — outreach and authority signals |
| `searchatlas_llm_visibility` | LLM Visibility | Tracks how AI models reference your brand and competitors |
| `searchatlas_keywords` | Keywords | Keyword research — volume, difficulty, SERP analysis, clustering |
| `searchatlas_website_studio` | Website Studio | Website builder — pages, layouts, and site structure |

### Management Tools (6)

| Tool | Description |
|------|-------------|
| `searchatlas_list_projects` | List projects with pagination and search |
| `searchatlas_create_project` | Create a new project by domain |
| `searchatlas_list_conversations` | List chat sessions, filtered by agent |
| `searchatlas_list_artifacts` | List generated artifacts (code, content, reports) |
| `searchatlas_list_playbooks` | List automation playbooks |
| `searchatlas_run_playbook` | Execute a playbook on a project |

## Usage Examples

### Ask the orchestrator a question

```
Use searchatlas_orchestrator with message "What are the top SEO issues for my site?" and project_id 42
```

### Run an SEO audit

```
Use searchatlas_otto_seo with message "Run a full technical SEO audit" and project_id 42
```

### Generate content

```
Use searchatlas_content with message "Write a blog post about technical SEO best practices" and project_id 42
```

### Research keywords

```
Use searchatlas_keywords with message "Find long-tail keywords for 'project management software'" and project_id 42
```

### List and run a playbook

```
1. Use searchatlas_list_playbooks to see available automations
2. Use searchatlas_run_playbook with the playbook_id and your project_id
```

## Local Development

### Prerequisites

- Node.js >= 18.0.0
- npm

### Setup

```bash
git clone https://gitlab.com/LinkLabs/searchatlas-mcp-server.git
cd searchatlas-mcp-server
npm install
```

### Build

```bash
npm run build        # Compile TypeScript to dist/
npm run dev          # Watch mode — recompiles on file changes
```

### Run locally

```bash
SEARCHATLAS_TOKEN=your-jwt-token node dist/index.js
```

### Test with MCP Inspector

The [MCP Inspector](https://github.com/modelcontextprotocol/inspector) provides a visual UI for testing MCP servers interactively.

```bash
SEARCHATLAS_TOKEN=your-jwt-token npx @modelcontextprotocol/inspector node dist/index.js
```

This opens a browser UI at `http://localhost:6274` where you can:

1. See all 16 tools listed in the left panel
2. Click any tool to see its input schema
3. Fill in parameters and click **Run Tool** to test
4. View the response in the result panel

> **Tip:** If the Inspector doesn't pass your env vars through, expand the **Environment Variables** section in the Inspector sidebar and add `SEARCHATLAS_TOKEN` there manually, then click **Restart**.

### Project Structure

```
searchatlas-mcp-server/
├── src/
│   ├── index.ts              # Entry point — MCP server + stdio transport
│   ├── config.ts             # Environment variable loading
│   ├── tools/
│   │   ├── register-all.ts   # Tool registration orchestrator
│   │   ├── agent-tools.ts    # 10 agent chat tools (factory-generated)
│   │   ├── project-tools.ts  # Project list/create
│   │   ├── conversation-tools.ts  # Chat session listing
│   │   ├── artifact-tools.ts # Generated artifact listing
│   │   └── playbook-tools.ts # Playbook list/execute
│   ├── types/
│   │   ├── agents.ts         # Agent endpoint registry
│   │   └── api.ts            # API response types
│   └── utils/
│       ├── api-client.ts     # HTTP + SSE streaming client
│       ├── auth.ts           # Auth header builder
│       ├── errors.ts         # Error types + formatter
│       └── session.ts        # Session/user ID helpers
├── dist/                     # Compiled output (git-ignored)
├── server.json               # MCP registry metadata
├── Dockerfile                # Multi-stage Docker build
├── package.json
├── tsconfig.json
└── LICENSE
```

## Publishing to npm

```bash
npm login
npm publish
```

After publishing, users can install with:

```bash
npm install -g searchatlas-mcp-server
```

Or run without installing:

```bash
npx searchatlas-mcp-server
```

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `Missing credentials` | No API key or token set | Set `SEARCHATLAS_API_KEY` or `SEARCHATLAS_TOKEN` env var |
| `fetch failed` | API URL unreachable | Check network; verify `SEARCHATLAS_API_URL` if overridden |
| `[401] Authentication failed` | Invalid or expired credentials | Get a fresh token from the SearchAtlas app |
| `[400] session_id required` | Outdated server build | Run `npm run build` to get the latest version with session support |
| Inspector doesn't pass env vars | Inspector UI limitation | Add env vars in the Inspector's **Environment Variables** panel |

## License

MIT
