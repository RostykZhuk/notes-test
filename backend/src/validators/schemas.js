const Joi = require('joi');

const authSchemas = {
  register: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().min(6).max(128).required().messages({
      'string.min': 'Password must be at least 6 characters long',
      'string.max': 'Password must not exceed 128 characters',
      'any.required': 'Password is required'
    })
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  })
};

const noteSchemas = {
  create: Joi.object({
    title: Joi.string().max(255).required().messages({
      'string.max': 'Title must not exceed 255 characters',
      'any.required': 'Title is required'
    }),
    content: Joi.string().allow('').max(50000).messages({
      'string.max': 'Content must not exceed 50,000 characters'
    }),
    tags: Joi.array().items(
      Joi.string().max(50).pattern(/^[a-zA-Z0-9_-]+$/)
    ).max(20).messages({
      'array.max': 'Maximum 20 tags allowed',
      'string.max': 'Each tag must not exceed 50 characters',
      'string.pattern.base': 'Tags can only contain letters, numbers, hyphens, and underscores'
    })
  }),

  update: Joi.object({
    title: Joi.string().max(255).messages({
      'string.max': 'Title must not exceed 255 characters'
    }),
    content: Joi.string().allow('').max(50000).messages({
      'string.max': 'Content must not exceed 50,000 characters'
    }),
    tags: Joi.array().items(
      Joi.string().max(50).pattern(/^[a-zA-Z0-9_-]+$/)
    ).max(20).messages({
      'array.max': 'Maximum 20 tags allowed',
      'string.max': 'Each tag must not exceed 50 characters',
      'string.pattern.base': 'Tags can only contain letters, numbers, hyphens, and underscores'
    })
  }).min(1).messages({
    'object.min': 'At least one field must be provided for update'
  }),

  query: Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(50),
    offset: Joi.number().integer().min(0).default(0),
    tags: Joi.alternatives().try(
      Joi.string(),
      Joi.array().items(Joi.string())
    ).messages({
      'alternatives.types': 'Tags must be a string or array of strings'
    })
  })
};

const paramSchemas = {
  noteId: Joi.object({
    id: Joi.number().integer().positive().required().messages({
      'number.base': 'Note ID must be a number',
      'number.positive': 'Note ID must be positive',
      'any.required': 'Note ID is required'
    })
  })
};

module.exports = {
  authSchemas,
  noteSchemas,
  paramSchemas
};
