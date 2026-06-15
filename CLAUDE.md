# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A web UI to manage Ollama models across one or more Ollama endpoints (list/pull/update/delete models, view running models, and chat with a model). An Express server proxies the Ollama API to a static, framework-free frontend.

## Commands

- `node server.js` — run the server (defaults to port 3000; `PORT` is honored, e.g. `PORT=3056 node server.js` to run a second instance without clobbering a live one).
- `npm start` — run under **PM2** in the background (`ecosystem.config.cjs`). Companions: `npm run stop` / `restart` / `kill` / `status` / `logs`.
- `npm run dev` — nodemon with reload on `js,html,css`. `npm run debug` / `debug:dev` — Node inspector.
- `npm run lint` / `npm run lint:fix` — ESLint (flat config in `eslint.config.js`). Enforces **single quotes and semicolons**.
- `npm test` — **no tests exist** (placeholder that exits 1). Verify changes by running the app, not via a test suite.
- Docker: `docker compose up` (`docker-compose.yaml` builds locally; `docker-compose-prebuilt.yaml` uses a published image).

## Configuration

- `OLLAMA_ENDPOINTS` (in `.env`, comma-separated) is the list of Ollama API base URLs the UI can switch between, e.g. `http://localhost:11434,https://remote:11434`. Defaults to `http://localhost:11434` if unset.

## Architecture

- **`server.js`** — the entire backend: an Express app that proxies the Ollama API. Routes: `/api/endpoints` + `/api/set-endpoint` (multi-endpoint switching; the active endpoint is module-level state), `/api/models` (enriches `/api/tags` with per-model `/api/show` details), `/api/ps`, `/api/pull`, `/api/update-model`, `/api/chat`, and serves `public/` statically.
- **Frontend is vanilla HTML/CSS/JS with no framework, bundler, or build step.** The actual application logic lives in the **inline `<script>` at the bottom of `public/index.html`** (model list/filter/sort/select, endpoint connect, pull, chat). `public/styles.css` themes via CSS variables and `[data-theme]` (dark default).
- **`public/script.js` is dead code** — it is not referenced by any page. Editing it has no effect; change the inline script in `index.html`.
- **Streaming pattern**: long Ollama operations (pull/update/chat) are proxied as newline-delimited JSON. The server uses `axios({ responseType: 'stream' })` and pipes chunks (`handleModelOperation` is the template for pull/update; `/api/chat` is similar). The browser reads them with `response.body.getReader()` + `TextDecoder`, splitting on `\n` and keeping a trailing partial-line buffer.
- **Chat** uses the Deep Chat web component (`<deep-chat>`, loaded from a pinned, SRI-checked CDN in `index.html`). Its handler maps Deep Chat messages (`role`/`text`) to Ollama's `role`/`content`, streams `/api/chat`, and forwards only an allow-list of inference `options`.

## Gotchas

- **In streaming routes, detect client disconnect with `res.on('close')` guarded by `!res.writableEnded` — never `req.on('close')`.** `express.json()` consumes the request body, so the `req` `'close'` event fires immediately and would abort the upstream Ollama request before it starts (yields empty responses).
- The inline `<script>` in `index.html` is **not** linted (ESLint only covers `**/*.js`); `script.js` is.
- ESLint (flat config) lints **all** `**/*.js`, so new non-standard JS needs a config entry: a `files: ['public/sw.js']` block adding service-worker globals (`self`, `caches`, …), and an `ignores` for vendored minified bundles (e.g. `public/vendor/**`).
- Model metadata is interpolated into the DOM in places (`displayModels`, `printModel`/`formatNestedHtml`) — escape model-derived values (name/tags/capabilities) before adding to such code (known XSS hardening area).

## Repository

This is a fork. `main` is kept identical to upstream `d3v0ps-cloud/OllamaModelManager`; **make changes on `dev`** (or feature branches off `dev`), never on `main`.

- **This repo is PUBLIC and mirrors to GitHub** (`github.com/0reo/OllamaModelManager`). Never commit private infra/identity: homelab hostnames, Tailnet IPs, container/machine names, absolute `/home/...` paths, or `.remember/` content.
