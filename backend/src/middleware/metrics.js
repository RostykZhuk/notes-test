const client = require('prom-client');

function createPrometheusMetrics() {
  // Create a Registry to register the metrics
  const register = new client.Registry();

  // Add a default label which is added to all metrics
  register.setDefaultLabels({
    app: 'quicknotes-api'
  });

  // Enable the collection of default metrics
  client.collectDefaultMetrics({ register });

  // Create custom metrics
  const httpRequestDuration = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status'],
    buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
  });

  const httpRequestsTotal = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status']
  });

  const activeUsers = new client.Gauge({
    name: 'active_users_total',
    help: 'Number of active users'
  });

  const notesTotal = new client.Gauge({
    name: 'notes_total',
    help: 'Total number of notes in the system'
  });

  // Register metrics
  register.registerMetric(httpRequestDuration);
  register.registerMetric(httpRequestsTotal);
  register.registerMetric(activeUsers);
  register.registerMetric(notesTotal);

  return {
    register,
    httpRequestDuration,
    httpRequestsTotal,
    activeUsers,
    notesTotal
  };
}

module.exports = { createPrometheusMetrics };
