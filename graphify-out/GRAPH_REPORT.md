# Graph Report - .  (2026-06-14)

## Corpus Check
- Corpus is ~14,934 words - fits in a single context window. You may not need a graph.

## Summary
- 168 nodes · 212 edges · 12 communities (11 shown, 1 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.83)
- Token cost: 136,358 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_API Routes & Frontend Logic|API Routes & Frontend Logic]]
- [[_COMMUNITY_OpenAPI Schemas & Components|OpenAPI Schemas & Components]]
- [[_COMMUNITY_OpenAPI Path Definitions|OpenAPI Path Definitions]]
- [[_COMMUNITY_Package Dependencies|Package Dependencies]]
- [[_COMMUNITY_OpenAPI Responses|OpenAPI Responses]]
- [[_COMMUNITY_Model Detail Schema|Model Detail Schema]]
- [[_COMMUNITY_NPM  PM2 Scripts|NPM / PM2 Scripts]]
- [[_COMMUNITY_Web UI Layout|Web UI Layout]]
- [[_COMMUNITY_DOM Rendering & XSS Hardening|DOM Rendering & XSS Hardening]]
- [[_COMMUNITY_Session Save State|Session Save State]]

## God Nodes (most connected - your core abstractions)
1. `scripts` - 13 edges
2. `refreshModels` - 8 edges
3. `paths` - 7 edges
4. `Available Models Table` - 7 edges
5. `responses` - 6 edges
6. `handleModelOperation()` - 6 edges
7. `buildModelRow` - 6 edges
8. `responses` - 5 edges
9. `200` - 5 edges
10. `application/json` - 5 edges

## Surprising Connections (you probably didn't know these)
- `NDJSON streaming proxy pattern` --semantically_similar_to--> `processUpdateStream`  [INFERRED] [semantically similar]
  server.js → public/index.html
- `pullModel` --references--> `NDJSON streaming proxy pattern`  [INFERRED]
  public/index.html → server.js
- `API documentation` --conceptually_related_to--> `OpenAPI spec (swagger.json)`  [INFERRED]
  docs/api.md → public/swagger.json
- `loadEndpoints` --references--> `GET /api/endpoints`  [EXTRACTED]
  public/index.html → server.js
- `API documentation` --references--> `POST /api/set-endpoint`  [EXTRACTED]
  docs/api.md → server.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Model pull/update streaming flow (frontend to Ollama)** — public_index_pullmodel, server_route_pull, server_handlemodeloperation, server_streaming_proxy, server_client_disconnect [EXTRACTED 0.90]
- **Multi-endpoint switching flow** — public_index_loadendpoints, public_index_setendpoint, server_route_endpoints, server_route_set_endpoint, server_ollamaendpoint [EXTRACTED 0.90]
- **XSS-safe model row DOM rendering** — public_index_buildmodelrow, public_index_buildnamenode, public_index_buildnestednodes, public_index_el, public_index_xss_dom_escaping [INFERRED 0.85]
- **Available Models management section** — demo_filter_input, demo_model_list, demo_model_actions, demo_bulk_controls, demo_model_metadata [EXTRACTED 1.00]

## Communities (12 total, 1 thin omitted)

### Community 0 - "API Routes & Frontend Logic"
Cohesion: 0.09
Nodes (32): API documentation, Deep Chat web component (SRI-pinned CDN), deleteModel, deleteSelectedModels, fetchRunningModels, handleUpdateStatus, loadEndpoints, populateChatModels (+24 more)

### Community 1 - "OpenAPI Schemas & Components"
Cohesion: 0.09
Nodes (24): components, schemas, description, properties, type, info, description, title (+16 more)

### Community 2 - "OpenAPI Path Definitions"
Cohesion: 0.14
Nodes (21): description, delete, post, post, post, description, requestBody, summary (+13 more)

### Community 3 - "Package Dependencies"
Cohesion: 0.11
Nodes (18): author, dependencies, axios, cors, dotenv, express, description, devDependencies (+10 more)

### Community 4 - "OpenAPI Responses"
Cohesion: 0.15
Nodes (18): content, description, content, content, description, get, get, get (+10 more)

### Community 5 - "Model Detail Schema"
Cohesion: 0.13
Nodes (15): items, type, type, type, type, properties, type, type (+7 more)

### Community 6 - "NPM / PM2 Scripts"
Cohesion: 0.15
Nodes (13): scripts, debug, debug:dev, dev, kill, lint, lint:fix, logs (+5 more)

### Community 7 - "Web UI Layout"
Cohesion: 0.24
Nodes (10): Ollama Model Manager Web UI, Refresh/Update/Delete Selected Controls, Connection Status Banner, Ollama Endpoints Selector, Model Filter Input, Per-Model Update/Delete Actions, Available Models Table, Model Metadata Columns (Size/Params/Family/Format/Q-Level) (+2 more)

### Community 8 - "DOM Rendering & XSS Hardening"
Cohesion: 0.31
Nodes (9): buildModelRow, buildNameNode, buildNestedNodes, displayModels, el (createElement helper), filterModels, printModel, sortModels (+1 more)

## Knowledge Gaps
- **68 isolated node(s):** `session`, `line`, `name`, `version`, `main` (+63 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `paths` connect `OpenAPI Path Definitions` to `OpenAPI Schemas & Components`, `OpenAPI Responses`?**
  _High betweenness centrality (0.117) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `Available Models Table` (e.g. with `Pull Model Input and Button` and `Running Models Panel`) actually correct?**
  _`Available Models Table` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `session`, `line`, `name` to the rest of the system?**
  _68 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `API Routes & Frontend Logic` be split into smaller, more focused modules?**
  _Cohesion score 0.0946969696969697 - nodes in this community are weakly interconnected._
- **Should `OpenAPI Schemas & Components` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._
- **Should `OpenAPI Path Definitions` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
- **Should `Package Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._