// @ts-check

// Load environment variables from .env file
require('dotenv').config({ path: '.env' });

/**
 * PM2 Ecosystem Configuration
 * @type {import('pm2').StartOptions}
 */
module.exports = {
  apps: [
    {
      name: "ok-web-frontend",
      script: "./.output/server/index.mjs",
      instances: 2, // Run 2 instances (or use "max" for all CPU cores)
      exec_mode: "cluster",
      // Load environment variables from .env file
      env: {
        ...process.env,
        NODE_ENV: process.env.NODE_ENV || "production",
        PORT: process.env.DOMAIN_PORT || 3001,
      },
      max_memory_restart: "2G",
      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 10000,
      // Auto restart on crash
      autorestart: true,
      // Wait for app to be ready before considering it online
      wait_ready: true,
      // Logging
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
    },
  ],
};
