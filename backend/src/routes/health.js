const express = require('express');
const { pool } = require('../database/postgres');
const { getRedisClient } = require('../database/redis');
const { logger } = require('../utils/logger');

const router = express.Router();

// Basic health check
router.get('/', async (req, res) => {
  try {
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0'
    };

    res.json(healthStatus);
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Detailed health check with dependencies
router.get('/detailed', async (req, res) => {
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    dependencies: {}
  };

  let overallStatus = 'healthy';

  // Check PostgreSQL
  try {
    const dbStart = Date.now();
    await pool.query('SELECT 1');
    const dbDuration = Date.now() - dbStart;
    
    healthStatus.dependencies.postgresql = {
      status: 'healthy',
      responseTime: `${dbDuration}ms`
    };
  } catch (error) {
    overallStatus = 'unhealthy';
    healthStatus.dependencies.postgresql = {
      status: 'unhealthy',
      error: error.message
    };
    logger.error('PostgreSQL health check failed:', error);
  }

  // Check Redis
  try {
    const redisStart = Date.now();
    const redisClient = getRedisClient();
    await redisClient.ping();
    const redisDuration = Date.now() - redisStart;
    
    healthStatus.dependencies.redis = {
      status: 'healthy',
      responseTime: `${redisDuration}ms`
    };
  } catch (error) {
    overallStatus = 'unhealthy';
    healthStatus.dependencies.redis = {
      status: 'unhealthy',
      error: error.message
    };
    logger.error('Redis health check failed:', error);
  }

  // Memory usage
  const memUsage = process.memoryUsage();
  healthStatus.memory = {
    rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
    heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
    external: `${Math.round(memUsage.external / 1024 / 1024)}MB`
  };

  healthStatus.status = overallStatus;

  const statusCode = overallStatus === 'healthy' ? 200 : 503;
  res.status(statusCode).json(healthStatus);
});

// Readiness probe (for Kubernetes/Docker)
router.get('/ready', async (req, res) => {
  try {
    // Check if app can serve requests
    await pool.query('SELECT 1');
    const redisClient = getRedisClient();
    await redisClient.ping();

    res.json({ status: 'ready' });
  } catch (error) {
    logger.error('Readiness check failed:', error);
    res.status(503).json({
      status: 'not ready',
      error: error.message
    });
  }
});

// Liveness probe (for Kubernetes/Docker)
router.get('/live', (req, res) => {
  // Simple check to ensure the process is running
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;
