const Joi = require('joi');

// Movie validation schema
const movieSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(1)
    .max(200)
    .required()
    .messages({
      'string.empty': 'Title cannot be empty',
      'string.max': 'Title cannot exceed 200 characters',
      'any.required': 'Title is required'
    }),
  
  director: Joi.string()
    .trim()
    .max(100)
    .allow('')
    .optional()
    .messages({
      'string.max': 'Director name cannot exceed 100 characters'
    }),
  
  releaseYear: Joi.number()
    .integer()
    .min(1800)
    .max(2100)
    .optional()
    .messages({
      'number.base': 'Release year must be a number',
      'number.integer': 'Release year must be an integer',
      'number.min': 'Release year must be after 1800',
      'number.max': 'Release year cannot exceed 2100'
    }),
  
  genre: Joi.string()
    .trim()
    .max(50)
    .allow('')
    .optional()
    .messages({
      'string.max': 'Genre cannot exceed 50 characters'
    }),
  
  rating: Joi.number()
    .min(1)
    .max(10)
    .precision(1)
    .optional()
    .messages({
      'number.base': 'Rating must be a number',
      'number.min': 'Rating must be at least 1',
      'number.max': 'Rating cannot exceed 10',
      'number.precision': 'Rating can have at most 1 decimal place'
    })
});

// Pagination validation schema
const paginationSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1'
    }),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(parseInt(process.env.MAX_PAGE_SIZE) || 100)
    .default(parseInt(process.env.DEFAULT_PAGE_SIZE) || 10)
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': `Limit cannot exceed ${process.env.MAX_PAGE_SIZE || 100}`
    })
});

// Query parameters validation schema
const queryParamsSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  sortBy: Joi.string().valid('title', 'director', 'releaseYear', 'genre', 'rating', 'createdAt').optional(),
  sortOrder: Joi.string().valid('asc', 'desc').optional(),
  genre: Joi.string().trim().optional(),
  director: Joi.string().trim().optional(),
  minRating: Joi.number().min(1).max(10).optional(),
  maxRating: Joi.number().min(1).max(10).optional(),
  year: Joi.number().integer().min(1800).max(2100).optional(),
  search: Joi.string().trim().optional()
});


 // Validate movie input data

const validateMovieInput = (data, options = {}) => {
  const defaultOptions = {
    abortEarly: false,
    stripUnknown: true,
    allowUnknown: false
  };
  
  const validationOptions = { ...defaultOptions, ...options };
  return movieSchema.validate(data, validationOptions);
};


//  Validate pagination parameters

const validatePaginationParams = (params) => {
  const { error, value } = paginationSchema.validate(params);
  if (error) {
    throw new Error(`Invalid pagination parameters: ${error.details[0].message}`);
  }
  return value;
};


 //Validate query parameters

const validateQueryParams = (params) => {
  return queryParamsSchema.validate(params, {
    abortEarly: false,
    stripUnknown: true,
    allowUnknown: false
  });
};


 // Validate MongoDB ObjectId

const validateObjectId = (id) => {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
};


 // Custom validation middleware for movie routes

const validateRequest = (schema) => {
  return (req, res, next) => {
    let validationSchema;
    let dataToValidate;

    switch (schema) {
      case 'movie':
        validationSchema = movieSchema;
        dataToValidate = req.body;
        break;
      case 'movieUpdate':
        // For updates, make all fields optional except validation rules
        validationSchema = movieSchema.fork(
          ['title'],
          (schema) => schema.optional()
        );
        dataToValidate = req.body;
        break;
      case 'query':
        validationSchema = queryParamsSchema;
        dataToValidate = req.query;
        break;
      default:
        return next(new Error('Invalid validation schema'));
    }

    const { error, value } = validationSchema.validate(dataToValidate, {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: false
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map(detail => detail.message)
      });
    }

    // Replace original data with validated data
    if (schema === 'query') {
      req.query = value;
    } else {
      req.body = value;
    }

    next();
  };
};

module.exports = {
  validateMovieInput,
  validatePaginationParams,
  validateQueryParams,
  validateObjectId,
  validateRequest,
  movieSchema,
  paginationSchema,
  queryParamsSchema
};