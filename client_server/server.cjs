'use strict';

// Local execute server for the mypc site: runs Node code from the browser (fs/path browse).
const http = require('http');
const { builtinModules } = require('module');

const AsyncFunction =
  typeof require('util').AsyncFunction === 'function'
    ? require('util').AsyncFunction
    : Object.getPrototypeOf(async function () {}).constructor;

const PORT = Number(process.env.PORT) || 3000;
const MAX_BODY_BYTES = 1024 * 1024;
const SHUTDOWN_TIMEOUT_MS = 30_000;

class BodyTooLargeError extends Error {
  constructor() {
    super('Request body exceeds 1 MB limit');
    this.name = 'BodyTooLargeError';
  }
}

function loadBuiltinModules() {
  const modules = Object.create(null);

  for (const name of builtinModules) {
    const key = name.startsWith('node:') ? name.slice(5) : name;
    if (key in modules) {
      continue;
    }

    try {
      modules[key] = require(name);
    } catch {
      // Some built-ins are not directly require-able in every runtime.
    }
  }

  modules.require = require;
  return modules;
}

const defaultArgs = loadBuiltinModules();

function mergeArgs(userArgs) {
  if (userArgs === undefined || userArgs === null) {
    return { ...defaultArgs };
  }

  if (typeof userArgs !== 'object' || Array.isArray(userArgs)) {
    throw new TypeError('"args" must be an object when provided');
  }

  return { ...defaultArgs, ...userArgs };
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let receivedBytes = 0;

    req.on('data', (chunk) => {
      receivedBytes += chunk.length;
      if (receivedBytes > MAX_BODY_BYTES) {
        req.destroy();
        reject(new BodyTooLargeError());
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      resolve(Buffer.concat(chunks).toString('utf8'));
    });

    req.on('error', reject);
    req.on('aborted', () => {
      reject(new Error('Request aborted'));
    });
  });
}

function buildCorsHeaders(req) {
  const origin = req.headers.origin;
  const headers = {
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Private-Network': 'true',
  };

  if (origin) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers.Vary = 'Origin';
  } else {
    headers['Access-Control-Allow-Origin'] = '*';
  }

  return headers;
}

function setCorsHeaders(req, res) {
  const headers = buildCorsHeaders(req);
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
}

function sendJson(req, res, statusCode, payload) {
  const body = JSON.stringify(payload);
  setCorsHeaders(req, res);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

function getPathname(req) {
  try {
    return new URL(req.url, 'http://127.0.0.1').pathname;
  } catch {
    return String(req.url || '/').split('?')[0];
  }
}

async function executeCode(code, args) {
  const fn = new AsyncFunction('args', code);
  return fn(args);
}

async function handleExecute(req, res) {
  let rawBody;

  try {
    rawBody = await readRequestBody(req);
  } catch (error) {
    if (error instanceof BodyTooLargeError) {
      sendJson(req, res, 400, {
        success: false,
        error: { message: error.message },
      });
      return;
    }
    throw error;
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    sendJson(req, res, 400, {
      success: false,
      error: { message: 'Invalid JSON request body' },
    });
    return;
  }

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    sendJson(req, res, 400, {
      success: false,
      error: { message: 'Request body must be a JSON object' },
    });
    return;
  }

  const { code, args: userArgs } = payload;

  if (typeof code !== 'string') {
    sendJson(req, res, 400, {
      success: false,
      error: { message: '"code" must be a string containing the function body' },
    });
    return;
  }

  let args;
  try {
    args = mergeArgs(userArgs);
  } catch (error) {
    sendJson(req, res, 400, {
      success: false,
      error: { message: error.message },
    });
    return;
  }

  try {
    const result = await executeCode(code, args);
    sendJson(req, res, 200, {
      success: true,
      result,
    });
  } catch (error) {
    sendJson(req, res, 500, {
      success: false,
      error: {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
    });
  }
}

function createRequestHandler(isShuttingDown) {
  return async (req, res) => {
    const pathname = getPathname(req);

    if (req.method === 'OPTIONS') {
      res.writeHead(204, buildCorsHeaders(req));
      res.end();
      return;
    }

    if (isShuttingDown()) {
      sendJson(req, res, 503, {
        success: false,
        error: { message: 'Server is shutting down' },
      });
      return;
    }

    if (pathname === '/health' && req.method === 'GET') {
      sendJson(req, res, 200, {
        success: true,
        result: { ok: true, service: 'execute-server' },
      });
      return;
    }

    if (pathname !== '/execute') {
      sendJson(req, res, 404, {
        success: false,
        error: { message: 'Not found' },
      });
      return;
    }

    if (req.method !== 'POST') {
      const body = JSON.stringify({
        success: false,
        error: { message: 'Method not allowed' },
      });
      setCorsHeaders(req, res);
      res.writeHead(405, {
        Allow: 'POST',
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(body),
      });
      res.end(body);
      return;
    }

    try {
      await handleExecute(req, res);
    } catch (error) {
      if (!res.headersSent) {
        sendJson(req, res, 500, {
          success: false,
          error: {
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
          },
        });
      } else {
        res.destroy();
      }
    }
  };
}

function startServer() {
  let shuttingDown = false;
  let activeConnections = 0;
  let shutdownTimer = null;
  let forceExitTimer = null;

  const server = http.createServer((req, res) => {
    activeConnections += 1;

    let connectionClosed = false;

    const onDone = () => {
      if (connectionClosed) {
        return;
      }
      connectionClosed = true;
      activeConnections -= 1;
      if (shuttingDown && activeConnections === 0) {
        server.close(() => {
          process.exit(0);
        });
      }
    };

    res.on('close', onDone);

    void createRequestHandler(() => shuttingDown)(req, res);
  });

  server.keepAliveTimeout = 5_000;
  server.headersTimeout = 65_000;

  server.listen(PORT, () => {
    console.log(`Execute server listening on http://127.0.0.1:${PORT}`);
    console.log('CORS + Local Network Access headers enabled for direct browser fetch');
  });

  const shutdown = (signal) => {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;
    console.log(`Received ${signal}, shutting down gracefully...`);

    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });

    shutdownTimer = setTimeout(() => {
      if (activeConnections > 0) {
        console.log(`Waiting for ${activeConnections} active connection(s) to finish...`);
      }
    }, 1_000);

    forceExitTimer = setTimeout(() => {
      console.error('Forced shutdown after timeout');
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
    shutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled rejection:', reason);
  });

  return {
    server,
    shutdown,
    clearTimers() {
      if (shutdownTimer) clearTimeout(shutdownTimer);
      if (forceExitTimer) clearTimeout(forceExitTimer);
    },
  };
}

if (require.main === module) {
  startServer();
}

module.exports = {
  startServer,
  executeCode,
  mergeArgs,
  loadBuiltinModules,
  MAX_BODY_BYTES,
};
