require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { createPrometheusMetrics } = require('./middleware/metrics');
const { logger } = require('./utils/logger');
const authRoutes = require('./routes/auth');
const notesRoutes = require('./routes/notes');
const healthRoutes = require('./routes/health');
const { errorHandler } = require('./middleware/errorHandler');
const { connectRedis } = require('./database/redis');
const { initDatabase } = require('./database/postgres');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Prometheus metrics
const { register, httpRequestDuration } = createPrometheusMetrics();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request timing middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(duration / 1000);
  });
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/health', healthRoutes);

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

async function startServer() {
  try {
    // Initialize database
    await initDatabase();
    logger.info('PostgreSQL database initialized');

    // Connect to Redis
    await connectRedis();
    logger.info('Redis connected');

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

startServer();
