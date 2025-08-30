const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Movie Management API',
      version: '1.0.0',
      description: 'A comprehensive RESTful API for managing movies with full CRUD operations',
      contact: {
        name: 'API Support',
        email: 'support@movieapi.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}/api/v1`,
        description: 'Development server'
      }
    ],
    components: {
      schemas: {
        Movie: {
          type: 'object',
          required: ['title'],
          properties: {
            _id: {
              type: 'string',
              description: 'Auto-generated MongoDB ObjectId',
              example: '64a7b8c9d1234567890abcde'
            },
            title: {
              type: 'string',
              description: 'Movie title',
              example: 'The Shawshank Redemption'
            },
            director: {
              type: 'string',
              description: 'Movie director',
              example: 'Frank Darabont'
            },
            releaseYear: {
              type: 'number',
              description: 'Year the movie was released',
              minimum: 1800,
              maximum: 2100,
              example: 1994
            },
            genre: {
              type: 'string',
              description: 'Movie genre',
              example: 'Drama'
            },
            rating: {
              type: 'number',
              description: 'Movie rating from 1 to 10',
              minimum: 1,
              maximum: 10,
              example: 9.3
            }
          }
        },
        MovieInput: {
          type: 'object',
          required: ['title'],
          properties: {
            title: {
              type: 'string',
              description: 'Movie title',
              example: 'The Shawshank Redemption'
            },
            director: {
              type: 'string',
              description: 'Movie director',
              example: 'Frank Darabont'
            },
            releaseYear: {
              type: 'number',
              description: 'Year the movie was released',
              minimum: 1800,
              maximum: 2100,
              example: 1994
            },
            genre: {
              type: 'string',
              description: 'Movie genre',
              example: 'Drama'
            },
            rating: {
              type: 'number',
              description: 'Movie rating from 1 to 10',
              minimum: 1,
              maximum: 10,
              example: 9.3
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message'
            },
            errors: {
              type: 'array',
              items: {
                type: 'string'
              }
            }
          }
        },
        PaginatedMovies: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Movie'
              }
            },
            pagination: {
              type: 'object',
              properties: {
                page: {
                  type: 'number',
                  example: 1
                },
                limit: {
                  type: 'number',
                  example: 10
                },
                total: {
                  type: 'number',
                  example: 100
                },
                pages: {
                  type: 'number',
                  example: 10
                }
              }
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;