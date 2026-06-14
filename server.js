import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { readFile } from 'fs/promises';
import { join } from 'path';
const app = express();

// Behind a reverse proxy (e.g. Caddy terminating TLS for a subdomain), trust the
// first hop so req.protocol / req.secure / req.ip reflect the X-Forwarded-* headers
// rather than the proxy's own connection. This presumes the app is reached ONLY via
// the trusted proxy; with HOST=0.0.0.0 it is also directly reachable, so any future
// IP-based logic (rate-limit, audit log, allow-list) must account for a spoofable
// X-Forwarded-For sent by a direct client.
app.set('trust proxy', 1);

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Serve swagger.json with explicit route
app.get('/swagger.json', async (req, res) => {
    try {
        const swaggerPath = join(process.cwd(), 'public', 'swagger.json');
        const swaggerContent = await readFile(swaggerPath, 'utf8');
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerContent);
    } catch (error) {
        console.error('Error serving swagger.json:', error);
        res.status(500).send({ error: 'Failed to load swagger.json' });
    }
});

// Serve static files after routes
app.use(express.static('public'));

// Store the Ollama endpoint
let ollamaEndpoint = 'http://localhost:11434';

// Get endpoints from environment variable
const getEndpoints = () => {
    const endpoints = process.env.OLLAMA_ENDPOINTS || 'http://localhost:11434';
    return endpoints.split(',').map(endpoint => endpoint.trim());
};

// Endpoint to get available Ollama endpoints
app.get('/api/endpoints', (req, res) => {
    res.json(getEndpoints());
});

// Endpoint to set Ollama API URL
app.post('/api/set-endpoint', async (req, res) => {
    const { endpoint } = req.body;
    ollamaEndpoint = endpoint;
    try {
        // Test the connection
        await axios.get(`${endpoint}/api/tags`);
        res.json({ success: true, message: 'Endpoint set successfully' });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Failed to connect to Ollama endpoint',
            error: error.message 
        });
    }
});

// Get running models from Ollama
app.get('/api/ps', async (req, res) => {
    try {
        const response = await axios.get(`${ollamaEndpoint}/api/ps`);

        const modelsWithCapabilities = await Promise.all(response.data.models.map(async (model) => {
            try {
                const showResponse = await axios.post(`${ollamaEndpoint}/api/show`, {
                    name: model.name
                });
                
                return {
                    ...model,
                    capabilities: showResponse.data.capabilities || ''
                };
            } catch {
                // If we can't get capabilities, return the model without them
                return model;
            }
        }));

        res.json({models:modelsWithCapabilities});
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch running models',
            error: error.message 
        });
    }
});

app.get('/api/models', async (req, res) => {
    try {
        const response = await axios.get(`${ollamaEndpoint}/api/tags`);
        
        // Get details for each model
        const modelsWithDetails = await Promise.all(response.data.models.map(async (model) => {
            try {
                const detailsResponse = await axios.post(`${ollamaEndpoint}/api/show`, {
                    name: model.name
                });
                // console.log(detailsResponse.data.model_info['general.tags'] !== undefined && model.name);
                
                return {
                    ...model,
                    // details: {
                    //     parent_model: detailsResponse.data.details?.parent_model || '',
                    //     format: detailsResponse.data.details?.format || '',
                    //     family: detailsResponse.data.details?.family || '',
                    //     families: detailsResponse.data.details?.families || [],
                    //     parameter_size: detailsResponse.data.details?.parameter_size || '',
                    //     quantization_level: detailsResponse.data.details?.quantization_level || '',
                    // },
                    details: detailsResponse.data.details,
                    capabilities: detailsResponse.data.capabilities || '',
                    parameters: detailsResponse.data.parameters || '',
                    template: detailsResponse.data.template || '',
                    tags: detailsResponse.data.model_info['general.tags'] || '',
                    model_info: detailsResponse.data.model_info || ''

                };
            } catch {
                // If we can't get details, return the model without them
                return model;
            }
        }));

        // Sort models alphabetically
        const sortedModels = modelsWithDetails.sort((a, b) => 
            a.name.localeCompare(b.name)
        );
        res.json(sortedModels);
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch models',
            error: error.message 
        });
    }
});

// Delete models from Ollama
app.delete('/api/models', async (req, res) => {
    const { models } = req.body;
    try {
        const results = await Promise.allSettled(models.map(model => 
            axios.delete(`${ollamaEndpoint}/api/delete`, {
                data: { name: model }
            })
        ));
        
        const failed = results
            .filter(r => r.status === 'rejected')
            .map((r, i) => models[i]);
            
        if (failed.length > 0) {
            res.status(500).json({ 
                success: false, 
                message: `Failed to delete models: ${failed.join(', ')}`,
            });
        } else {
            res.json({ success: true, message: 'Models deleted successfully' });
        }
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Failed to process delete request',
            error: error.message 
        });
    }
});

// Handle streaming response for model operations
const handleModelOperation = async (req, res, operation) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Transfer-Encoding', 'chunked');

    // AbortController lets a client disconnect (e.g. the user clicking "Cancel" on a pull)
    // actually stop the upstream Ollama download instead of leaving it running to completion.
    const controller = new AbortController();
    let hasEnded = false;
    const endResponse = (error) => {
        if (hasEnded) return;
        hasEnded = true;
        if (error) {
            try {
                res.write(JSON.stringify({ status: 'error', error: error.message }) + '\n');
            } catch (writeErr) {
                // The client is gone, so it can't receive this — but log why the pull failed so
                // the operator isn't left with no record of a genuine upstream fault.
                console.error('Failed to deliver pull error to client (socket closed?):', error.message, writeErr.message);
            }
        }
        try { res.end(); } catch { /* socket already gone */ }
    };

    // Detect client disconnect with res 'close' guarded by !writableEnded — NOT req 'close'.
    // express.json() has already consumed the request body, so req would fire 'close'
    // immediately and abort the upstream pull before it even starts.
    res.on('close', () => {
        if (!res.writableEnded) controller.abort();
    });

    try {
        const response = await axios({
            method: 'post',
            url: `${ollamaEndpoint}/api/pull`,
            data: operation,
            responseType: 'stream',
            signal: controller.signal
        });

        response.data.on('data', (chunk) => {
            try {
                const lines = chunk.toString().split('\n');
                lines.forEach(line => {
                    if (line.trim()) {
                        try {
                            JSON.parse(line);
                            res.write(line + '\n');
                        } catch {
                            console.error('Invalid JSON in response:', line);
                        }
                    }
                });
            } catch (error) {
                console.error('Error processing chunk:', error);
                endResponse(error);
            }
        });

        response.data.on('end', () => endResponse());
        response.data.on('error', (error) => {
            // A client cancel aborts the upstream stream — that's a clean close, not an error.
            if (error.code === 'ERR_CANCELED' || error.name === 'AbortError') {
                endResponse();
            } else {
                console.error('Stream error:', error);
                endResponse(error);
            }
        });

    } catch (error) {
        if (error.code === 'ERR_CANCELED') { endResponse(); return; }
        console.error('Failed to start operation:', error);
        endResponse(error);
    }
};

// Endpoint to pull a model
app.post('/api/pull', async (req, res) => {
    const { model } = req.body;
    if (!model) {
        return res.status(400).json({ 
            success: false, 
            message: 'Model name is required' 
        });
    }
    await handleModelOperation(req, res, { model });
});

// Endpoint to update a model
app.post('/api/update-model', async (req, res) => {
    const { modelName } = req.body;
    if (!modelName) {
        return res.status(400).json({ 
            success: false, 
            message: 'Model name is required' 
        });
    }
    await handleModelOperation(req, res, { model: modelName });
});

// Chat with a model — streaming proxy to Ollama's /api/chat (NDJSON passed through)
app.post('/api/chat', async (req, res) => {
    const { model, messages, options } = req.body;
    if (!model || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'A model and a non-empty messages array are required'
        });
    }

    // Forward only a safe allow-list of inference options. CORS is open ('*'), so an arbitrary
    // client could otherwise set e.g. num_ctx and OOM the Ollama host.
    let safeOptions;
    if (options && typeof options === 'object') {
        const ALLOWED = ['temperature', 'top_p', 'top_k', 'num_predict', 'repeat_penalty', 'stop', 'seed'];
        safeOptions = {};
        for (const k of ALLOWED) if (options[k] !== undefined) safeOptions[k] = options[k];
        if (Object.keys(safeOptions).length === 0) safeOptions = undefined;
    }

    const controller = new AbortController();
    let hasEnded = false;
    const endResponse = (error) => {
        if (hasEnded) return;
        hasEnded = true;
        if (error) {
            try { res.write(JSON.stringify({ error: error.message }) + '\n'); } catch { /* client gone */ }
        }
        res.end();
    };

    // If the client disconnects mid-stream (e.g. user clicked Stop), abort upstream generation.
    // Use res 'close' (fires when the connection ends) guarded by writableEnded — NOT req 'close',
    // which fires as soon as express.json() finishes reading the body and would abort prematurely.
    res.on('close', () => {
        if (!res.writableEnded) controller.abort();
    });

    try {
        const response = await axios({
            method: 'post',
            url: `${ollamaEndpoint}/api/chat`,
            data: { model, messages, stream: true, ...(safeOptions ? { options: safeOptions } : {}) },
            responseType: 'stream',
            signal: controller.signal
        });

        res.setHeader('Content-Type', 'application/x-ndjson');
        res.setHeader('Transfer-Encoding', 'chunked');

        response.data.on('data', (chunk) => res.write(chunk));
        response.data.on('end', () => endResponse());
        response.data.on('error', (error) => {
            // A client disconnect aborts the upstream stream — clean close, not an error to report
            if (error.code === 'ERR_CANCELED' || error.name === 'AbortError') endResponse();
            else endResponse(error);
        });
    } catch (error) {
        if (error.code === 'ERR_CANCELED') return; // client aborted before the stream began
        console.error('Chat request failed:', error.code || '', error.message);
        if (!res.headersSent) {
            res.status(502).json({
                success: false,
                message: 'Failed to reach the Ollama chat endpoint',
                error: error.message
            });
        } else {
            endResponse(error);
        }
    }
});

const PORT = process.env.PORT || 3000;
// Bind all interfaces by default so a reverse proxy (possibly running in a
// container or on another host) can reach the app; override with HOST to restrict it.
const HOST = process.env.HOST || '0.0.0.0';
const server = app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT} (bound ${HOST}:${PORT})`);
});
// Surface bind failures as one actionable line instead of an uncaught stack trace.
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} on ${HOST} is already in use — set a different PORT or stop the other instance.`);
    } else if (err.code === 'EADDRNOTAVAIL') {
        console.error(`Cannot bind HOST=${HOST}: no local interface has that address — check the HOST env var.`);
    } else {
        console.error(`Server failed to start on ${HOST}:${PORT}:`, err.message);
    }
    process.exit(1);
});
