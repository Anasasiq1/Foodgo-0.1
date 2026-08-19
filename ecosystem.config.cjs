/**
 * Foodgo Production PM2 Configuration
 * For aaPanel Node.js Manager, VPS, and Cloud Servers
 */

module.exports = {
  apps: [
    {
      name: 'foodgo',
      script: 'server.ts',
      interpreter: 'node',
      interpreter_args: '--import tsx',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: './storage/logs/pm2-error.log',
      out_file: './storage/logs/pm2-out.log',
      merge_logs: true,
    },
  ],
};
