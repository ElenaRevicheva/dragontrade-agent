module.exports = {
  apps: [
    {
      name: 'dragontrade-main',
      script: 'index.js',
      cwd: '/home/ubuntu/dragontrade-agent',
      node_args: '--max-old-space-size=512',
      env: { NODE_ENV: 'production', DISABLE_STREAM: '1' },
      restart_delay: 5000,
      max_restarts: 10,
      watch: false,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      name: 'algom-stream',
      script: 'algom-stream-standalone.js',
      cwd: '/home/ubuntu/dragontrade-agent',
      node_args: '--max-old-space-size=256',
      env: { NODE_ENV: 'production' },
      restart_delay: 30000,
      max_restarts: 5,
      watch: false,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      name: 'algom-poll',
      script: 'algom-poll.js',
      cwd: '/home/ubuntu/dragontrade-agent',
      node_args: '--max-old-space-size=256',
      env: { NODE_ENV: 'production' },
      restart_delay: 10000,
      max_restarts: 10,
      watch: false,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      name: 'dragontrade-bybit',
      script: 'production-paper-bot-professional.js',
      cwd: '/home/ubuntu/dragontrade-agent',
      env: { NODE_ENV: 'production', EXCHANGE: 'bybit' },
      restart_delay: 5000,
      max_restarts: 10,
      watch: false,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      name: 'dragontrade-binance',
      script: 'production-paper-bot-professional.js',
      cwd: '/home/ubuntu/dragontrade-agent',
      env: { NODE_ENV: 'production', EXCHANGE: 'binance' },
      restart_delay: 5000,
      max_restarts: 10,
      watch: false,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      name: 'dragontrade-dashboard',
      script: 'dashboard-server.js',
      cwd: '/home/ubuntu/dragontrade-agent',
      env: { NODE_ENV: 'production', PORT: 3001 },
      restart_delay: 5000,
      max_restarts: 10,
      watch: false,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
