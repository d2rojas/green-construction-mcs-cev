module.exports = {
  apps: [
    {
      name: 'mcs-cev-backend',
      script: 'optimization-interface/backend/server.js',
      cwd: '/var/www/mcs-cev-optimization',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true
    },
    {
      name: 'mcs-cev-frontend',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/mcs-cev-optimization/optimization-interface',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true
    }
  ]
};
