# Ollama Model Manager

A web-based management interface for Ollama endpoints, allowing you to manage and interact with multiple Ollama instances from a single dashboard.

<img src="demo.png" width="50%" alt="Demo Screenshot">


## Features

- Connect to multiple Ollama endpoints simultaneously
- Web-based interface for model management
- Support for both local and remote Ollama instances
- Filter Models
- Sort Models\
- Select Multiple Models or All Models
- Delete Selected Models
- Light & Dark Theme (defaults dark)
- Update Models
- Running Models Stats
- Pull Models from Ollama Hub
- Swagger API Documentation
- [Unraid Deployment Guide (untested)](https://github.com/d3v0ps-cloud/OllamaModelManager/blob/main/docs/unraid.md)

## Prerequisites

- Node.js 20.x or later (for npm installation)
- Docker and Docker Compose (for Docker installation)
- One or more running Ollama instances

## Installation

### Using npm

1. Clone the repository:
```bash
git clone https://github.com/d3v0ps-cloud/OllamaModelManager.git
```

```bash
cd OllamaModelManager
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and configure your Ollama endpoints:
```bash
OLLAMA_ENDPOINTS=http://localhost:11434,https://ollama1.remote.net,https://ollama2.remote.net
```

4. Start the application:

Development mode (with hot reload):
```bash
npm run dev
```

Production mode (runs in the background via PM2):
```bash
npm start
```

The application will be available at `http://localhost:3000`

### Managing the background process

| Command | Description |
|---|---|
| `npm start` | Start in background |
| `npm stop` | Stop the process |
| `npm restart` | Restart the process |
| `npm run kill` | Stop and remove from PM2 |
| `npm run status` | Show process status |
| `npm run logs` | Tail logs |

To auto-start on system boot:
```bash
npx pm2 startup
npx pm2 save
```

### Using Docker

#### Option 1 - Build your own image

1. Clone the repository:
```bash
git clone https://github.com/d3v0ps-cloud/OllamaModelManager.git
```

```bash
cd OllamaModelManager
```

2. Configure your Ollama endpoints in `docker-compose.yml`:
```yaml
environment:
  - OLLAMA_ENDPOINTS=http://your-ollama-ip:11434,https://ollama1.remote.net
```

3. Build and start the container:
```bash
docker compose up -d
```

The application will be available at `http://localhost:3000`

#### Option 2 - Use the prebuilt image

1. Copy down the Pre-Built Compose file:
```bash
docker-compose-prebuilt.yml
```

2. Configure your Ollama endpoints in `docker-compose-prebuilt.yml`:
```yaml
environment:
  - OLLAMA_ENDPOINTS=http://your-ollama-ip:11434,https://ollama1.remote.net
```

3. Build and start the container:
```bash
docker compose up -d
```

The application will be available at `http://localhost:3000`

## Configuration

### Environment Variables

- `OLLAMA_ENDPOINTS`: Comma-separated list of Ollama API endpoints (required)
  - Format: `http://host1:port,http://host2:port`
  - Example: `http://192.168.1.10:11434,https://ollama1.remote.net`
- `PORT`: Port to listen on (default `3000`).
- `HOST`: Interface to bind (default `0.0.0.0`, i.e. all interfaces). Leave as the
  default when fronting the app with a reverse proxy.

## Reaching the app at a subdomain over Tailscale (Caddy)

The app is reverse-proxy ready: it binds all interfaces by default and sets
`trust proxy`, so it honours `X-Forwarded-Proto`/`-Host` from a TLS-terminating
proxy, and all client requests use **relative** URLs (so it works under any
hostname, not just `localhost`). To reach it at a memorable subdomain with no
port — e.g. `https://ollama.internal.com` — front it with the host's Caddy +
Headscale setup:

1. **MagicDNS record** (on the Headscale server) so the name resolves on the
   Tailnet — add under `dns.extra_records` and restart Headscale:
   ```yaml
   - { name: "ollama.internal.com", type: "A", value: "10.0.0.1" }
   ```
2. **Caddy vhost** (`~/.config/caddy/Caddyfile`) → reverse-proxy to the app on the
   **Docker bridge gateway** (`172.17.0.1`), not `127.0.0.1`:
   ```caddyfile
   ollama.internal.com {
       tls internal
       reverse_proxy 172.17.0.1:3000
   }
   ```
3. **Apply:** `docker restart proxy` (a restart re-binds the Caddyfile and
   provisions certs; a bare `reload` can miss them).
4. **Verify:** from a Tailnet device, open `https://ollama.internal.com`.

> `tls internal` uses an internal CA, so browsers show a one-time
> `ERR_CERT_AUTHORITY_INVALID` prompt. For a fully trusted cert (and to host the
> app as an installable PWA, which requires it), use a public hostname with
> Let's Encrypt instead.

## Development

Run with hot reload (nodemon):

```bash
npm run dev
```

