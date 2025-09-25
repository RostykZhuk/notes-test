const express = require('express');
const Note = require('../models/Note');
const { authenticateToken } = require('../middleware/auth');
const { noteSchemas, paramSchemas } = require('../validators/schemas');
const { cacheGet, cacheSet, cacheDelPattern } = require('../database/redis');
const { logger } = require('../utils/logger');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Helper function to generate cache key
const getCacheKey = (userId, type, params = '') => {
  return `notes:${userId}:${type}:${params}`;
};

// Helper function to clear user's note cache
const clearUserNoteCache = async (userId) => {
  await cacheDelPattern(`notes:${userId}:*`);
};

// Get all notes for authenticated user
router.get('/', async (req, res, next) => {
  try {
    // Validate query parameters
    const { error, value } = noteSchemas.query.validate(req.query);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(detail => detail.message)
      });
    }

    const { limit, offset, tags } = value;
    const userId = req.user.userId;

    // Convert tags to array if it's a string
    let tagsArray = [];
    if (tags) {
      tagsArray = Array.isArray(tags) ? tags : [tags];
    }

    // Generate cache key
    const cacheKey = getCacheKey(userId, 'list', `${limit}-${offset}-${tagsArray.join(',')}`);
    
    // Try to get from cache first
    let notes = await cacheGet(cacheKey);
    
    if (!notes) {
      // Get from database
      notes = await Note.findByUserId(userId, { limit, offset, tags: tagsArray });
      
      // Cache the result for 5 minutes
      await cacheSet(cacheKey, notes, 300);
      logger.debug(`Notes cached for user ${userId}`);
    } else {
      logger.debug(`Notes served from cache for user ${userId}`);
    }

    // Get total count for pagination
    const totalCount = await Note.count(userId);

    res.json({
      notes,
      pagination: {
        limit,
        offset,
        total: totalCount,
        hasMore: offset + limit < totalCount
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get user's tags
router.get('/tags', async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const cacheKey = getCacheKey(userId, 'tags');
    
    // Try cache first
    let tags = await cacheGet(cacheKey);
    
    if (!tags) {
      tags = await Note.getUserTags(userId);
      await cacheSet(cacheKey, tags, 600); // Cache for 10 minutes
    }

    res.json({ tags });
  } catch (error) {
    next(error);
  }
});

// Search notes by tags
router.get('/search', async (req, res, next) => {
  try {
    const { tags } = req.query;
    
    if (!tags) {
      return res.status(400).json({ error: 'Tags parameter is required for search' });
    }

    const userId = req.user.userId;
    const tagsArray = Array.isArray(tags) ? tags : [tags];
    
    // Generate cache key for search
    const cacheKey = getCacheKey(userId, 'search', tagsArray.join(','));
    
    // Try cache first
    let notes = await cacheGet(cacheKey);
    
    if (!notes) {
      notes = await Note.searchByTags(userId, tagsArray);
      await cacheSet(cacheKey, notes, 300); // Cache for 5 minutes
      logger.debug(`Search results cached for user ${userId}, tags: ${tagsArray.join(',')}`);
    } else {
      logger.debug(`Search results served from cache for user ${userId}`);
    }

    res.json({ notes, searchTags: tagsArray });
  } catch (error) {
    next(error);
  }
});

// Get a specific note
router.get('/:id', async (req, res, next) => {
  try {
    // Validate parameters
    const { error, value } = paramSchemas.noteId.validate(req.params);
    if (error) {
      return res.status(400).json({
        error: 'Invalid note ID',
        details: error.details.map(detail => detail.message)
      });
    }

    const { id } = value;
    const userId = req.user.userId;

    const note = await Note.findById(id, userId);
    
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({ note });
  } catch (error) {
    next(error);
  }
});

// Create a new note
router.post('/', async (req, res, next) => {
  try {
    // Validate request body
    const { error, value } = noteSchemas.create.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(detail => detail.message)
      });
    }

    const { title, content, tags } = value;
    const userId = req.user.userId;

    const note = await Note.create({
      userId,
      title,
      content: content || '',
      tags: tags || []
    });

    // Clear user's note cache
    await clearUserNoteCache(userId);

    logger.info(`Note created by user ${userId}: ${note.id}`);

    res.status(201).json({
      message: 'Note created successfully',
      note
    });
  } catch (error) {
    next(error);
  }
});

// Update a note
router.put('/:id', async (req, res, next) => {
  try {
    // Validate parameters
    const paramValidation = paramSchemas.noteId.validate(req.params);
    if (paramValidation.error) {
      return res.status(400).json({
        error: 'Invalid note ID',
        details: paramValidation.error.details.map(detail => detail.message)
      });
    }

    // Validate request body
    const { error, value } = noteSchemas.update.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(detail => detail.message)
      });
    }

    const { id } = paramValidation.value;
    const userId = req.user.userId;

    // Check if note exists
    const existingNote = await Note.findById(id, userId);
    if (!existingNote) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const updatedNote = await Note.update(id, userId, value);

    // Clear user's note cache
    await clearUserNoteCache(userId);

    logger.info(`Note updated by user ${userId}: ${id}`);

    res.json({
      message: 'Note updated successfully',
      note: updatedNote
    });
  } catch (error) {
    next(error);
  }
});

// Delete a note
router.delete('/:id', async (req, res, next) => {
  try {
    // Validate parameters
    const { error, value } = paramSchemas.noteId.validate(req.params);
    if (error) {
      return res.status(400).json({
        error: 'Invalid note ID',
        details: error.details.map(detail => detail.message)
      });
    }

    const { id } = value;
    const userId = req.user.userId;

    const deletedNote = await Note.delete(id, userId);
    
    if (!deletedNote) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Clear user's note cache
    await clearUserNoteCache(userId);

    logger.info(`Note deleted by user ${userId}: ${id}`);

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
