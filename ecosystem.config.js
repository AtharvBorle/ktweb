const path = require('path');

module.exports = {
  apps: [
    {
      name: 'kunaltilak-backend-prod',
      script: 'server.js',
      cwd: path.resolve(__dirname, 'backend'),
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: path.resolve(__dirname, 'backend/logs/prod-error.log'),
      out_file: path.resolve(__dirname, 'backend/logs/prod-out.log'),
      merge_logs: true,
      time: true
    },
    {
      name: 'kunaltilak-backend-dev',
      script: 'server.js',
      cwd: path.resolve(__dirname, 'backend'),
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'development',
        PORT: 5001
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 5001
      },
      error_file: path.resolve(__dirname, 'backend/logs/dev-error.log'),
      out_file: path.resolve(__dirname, 'backend/logs/dev-out.log'),
      merge_logs: true,
      time: true
    }
  ]
};
