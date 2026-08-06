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
      script: "./production/server/index.mjs",
      instances: 3, // Run 3 instances
      exec_mode: "cluster",
      // Load environment variables from .env file
      env: {
        ...process.env,
        NODE_ENV: process.env.NODE_ENV || "production",
        PORT: process.env.DOMAIN_PORT || 3001,
      },
      max_memory_restart: "1200M",
      // Graceful shutdown settings for zero-downtime deployment
      kill_timeout: 5000,          // Wait 5s for graceful shutdown
      listen_timeout: 10000,        // Wait 10s for app to be ready
      shutdown_with_message: false, // Use SIGINT for graceful shutdown
      // Auto restart on crash
      autorestart: true,
      max_restarts: 10,             // Restart up to 10 times
      min_uptime: "10s",            // Must run 10s to be considered stable
      restart_delay: 1000,          // Wait 1s before restarting crashed app
      // Wait for app to be ready before considering it online
      wait_ready: true,
      // Zero-downtime reload settings
      // increment_var: "PORT",        // Increment port for each instance if needed
      // Logging
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      // Time-based log rotation
      log_type: "json",
    },
  ],
};
