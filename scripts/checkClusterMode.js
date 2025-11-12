#!/usr/bin/env node

/**
 * Script to demonstrate cluster mode behavior
 * Run with: node scripts/checkClusterMode.js
 */

import cluster from 'node:cluster';
import http from 'node:http';
import os from 'node:os';

const PORT = 3002;
const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`Primary process ${process.pid} is running`);
  console.log(`Forking ${Math.min(2, numCPUs)} workers...`);

  // Fork workers
  for (let i = 0; i < Math.min(2, numCPUs); i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
  });

  cluster.on('online', (worker) => {
    console.log(`Worker ${worker.process.pid} is online`);
  });

  console.log(`\nAll workers are sharing port ${PORT}`);
  console.log('Try making requests: curl http://localhost:3002');
  console.log('Each request will be handled by different workers (round-robin)\n');
} else {
  // Workers can share the same TCP connection
  const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end(`Hello from worker ${process.pid}\n`);
  });

  server.listen(PORT, () => {
    console.log(`Worker ${process.pid} ready to accept connections on port ${PORT}`);
  });
}
