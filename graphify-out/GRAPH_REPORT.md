# Graph Report - .  (2026-06-14)

## Corpus Check
- Corpus is ~15,336 words - fits in a single context window. You may not need a graph.

## Summary
- 149 nodes · 182 edges · 13 communities (12 shown, 1 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 11 edges (avg confidence: 0.83)
- Token cost: 76,887 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Package Config & Dependencies|Package Config & Dependencies]]
- [[_COMMUNITY_OpenAPI Schemas & Components|OpenAPI Schemas & Components]]
- [[_COMMUNITY_OpenAPI Path Operations|OpenAPI Path Operations]]
- [[_COMMUNITY_OpenAPI Paths & Requests|OpenAPI Paths & Requests]]
- [[_COMMUNITY_Backend Streaming & Proxy|Backend Streaming & Proxy]]
- [[_COMMUNITY_Model Detail Schema|Model Detail Schema]]
- [[_COMMUNITY_NPM  PM2 Scripts|NPM / PM2 Scripts]]
- [[_COMMUNITY_Web UI Layout|Web UI Layout]]
- [[_COMMUNITY_Deployment & Reverse-Proxy Config|Deployment & Reverse-Proxy Config]]
- [[_COMMUNITY_OpenAPI Spec Info|OpenAPI Spec Info]]
- [[_COMMUNITY_OpenAPI Content Types|OpenAPI Content Types]]
- [[_COMMUNITY_API Documentation|API Documentation]]
- [[_COMMUNITY_Stale Issues Workflow|Stale Issues Workflow]]

## God Nodes (most connected - your core abstractions)
1. `scripts` - 13 edges
2. `paths` - 7 edges
3. `Available Models Table` - 7 edges
4. `responses` - 6 edges
5. `Frontend SPA (public/index.html inline script)` - 6 edges
6. `responses` - 5 edges
7. `200` - 5 edges
8. `application/json` - 5 edges
9. `post` - 5 edges
10. `requestBody` - 5 edges

## Surprising Connections (you probably didn't know these)
- `public/script.js (dead code)` --semantically_similar_to--> `Frontend SPA (public/index.html inline script)`  [INFERRED] [semantically similar]
  CLAUDE.md → public/index.html
- `Multi-Endpoint Switching (module-level active endpoint)` --references--> `OLLAMA_ENDPOINTS Env Var`  [EXTRACTED]
  server.js → README.md
- `Deep Chat Web Component` --shares_data_with--> `Chat Inference Options Allow-List`  [INFERRED]
  public/index.html → server.js
- `res.on('close') Client-Disconnect Detection` --rationale_for--> `handleModelOperation()`  [EXTRACTED]
  CLAUDE.md → server.js
- `Frontend SPA (public/index.html inline script)` --implements--> `Newline-Delimited JSON Streaming Pattern`  [EXTRACTED]
  public/index.html → server.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Available Models management section** — demo_filter_input, demo_model_list, demo_model_actions, demo_bulk_controls, demo_model_metadata [EXTRACTED 1.00]
- **NDJSON Streaming Proxy Flow (pull/update/chat)** — server_handlemodeloperation, ndjson_streaming, index, client_disconnect_gotcha [INFERRED 0.85]
- **Docker Build and Deploy Pipeline** — build, docker_compose, docker_compose_prebuilt, unraid [INFERRED 0.75]

## Communities (13 total, 1 thin omitted)

### Community 0 - "Package Config & Dependencies"
Cohesion: 0.10
Nodes (19): Dependabot Config, author, dependencies, axios, cors, dotenv, express, description (+11 more)

### Community 1 - "OpenAPI Schemas & Components"
Cohesion: 0.13
Nodes (18): components, schemas, description, properties, type, description, type, type (+10 more)

### Community 2 - "OpenAPI Path Operations"
Cohesion: 0.16
Nodes (17): description, description, get, delete, get, get, description, responses (+9 more)

### Community 3 - "OpenAPI Paths & Requests"
Cohesion: 0.20
Nodes (16): description, post, post, post, requestBody, paths, /api/pull, /api/set-endpoint (+8 more)

### Community 4 - "Backend Streaming & Proxy"
Cohesion: 0.18
Nodes (12): Chat Inference Options Allow-List, CLAUDE.md Project Guidance, res.on('close') Client-Disconnect Detection, public/script.js (dead code), Deep Chat Web Component, Frontend SPA (public/index.html inline script), Newline-Delimited JSON Streaming Pattern, Ollama API Proxy Pattern (+4 more)

### Community 5 - "Model Detail Schema"
Cohesion: 0.13
Nodes (15): items, type, type, type, type, properties, type, type (+7 more)

### Community 6 - "NPM / PM2 Scripts"
Cohesion: 0.15
Nodes (13): scripts, debug, debug:dev, dev, kill, lint, lint:fix, logs (+5 more)

### Community 7 - "Web UI Layout"
Cohesion: 0.24
Nodes (10): Ollama Model Manager Web UI, Refresh/Update/Delete Selected Controls, Connection Status Banner, Ollama Endpoints Selector, Model Filter Input, Per-Model Update/Delete Actions, Available Models Table, Model Metadata Columns (Size/Params/Family/Format/Q-Level) (+2 more)

### Community 8 - "Deployment & Reverse-Proxy Config"
Cohesion: 0.36
Nodes (7): Build and Push Workflow, docker-compose.yaml (local build), Multi-Endpoint Switching (module-level active endpoint), OLLAMA_ENDPOINTS Env Var, README, Reverse-Proxy Readiness (trust proxy / HOST bind), Unraid Deployment Guide

### Community 9 - "OpenAPI Spec Info"
Cohesion: 0.29
Nodes (6): info, description, title, version, openapi, servers

### Community 10 - "OpenAPI Content Types"
Cohesion: 0.33
Nodes (6): content, content, content, schema, application/json, application/x-ndjson

### Community 11 - "API Documentation"
Cohesion: 0.67
Nodes (3): API documentation, OpenAPI spec (swagger.json), Swagger UI page

## Knowledge Gaps
- **66 isolated node(s):** `name`, `version`, `main`, `type`, `start` (+61 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `paths` connect `OpenAPI Paths & Requests` to `OpenAPI Spec Info`, `OpenAPI Path Operations`?**
  _High betweenness centrality (0.149) - this node is a cross-community bridge._
- **Why does `components` connect `OpenAPI Schemas & Components` to `OpenAPI Spec Info`?**
  _High betweenness centrality (0.135) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `Available Models Table` (e.g. with `Pull Model Input and Button` and `Running Models Panel`) actually correct?**
  _`Available Models Table` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `version`, `main` to the rest of the system?**
  _68 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Package Config & Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `OpenAPI Schemas & Components` be split into smaller, more focused modules?**
  _Cohesion score 0.13071895424836602 - nodes in this community are weakly interconnected._
- **Should `Model Detail Schema` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._