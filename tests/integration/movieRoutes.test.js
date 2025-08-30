const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/server');
const Movie = require('../../src/models/Movie');

describe('Movie API Integration Tests', () => {
  let movieId;

  const sampleMovie = {
    title: 'The Shawshank Redemption',
    director: 'Frank Darabont',
    releaseYear: 1994,
    genre: 'Drama',
    rating: 9.3
  };

  const sampleMovie2 = {
    title: 'The Godfather',
    director: 'Francis Ford Coppola',
    releaseYear: 1972,
    genre: 'Crime',
    rating: 9.2
  };

  describe('POST /api/v1/movies', () => {
    it('should create a new movie', async () => {
      const response = await request(app)
        .post('/api/v1/movies')
        .send(sampleMovie)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Movie created successfully');
      expect(response.body.data.title).toBe(sampleMovie.title);
      expect(response.body.data.director).toBe(sampleMovie.director);
      expect(response.body.data.releaseYear).toBe(sampleMovie.releaseYear);
      expect(response.body.data.genre).toBe(sampleMovie.genre);
      expect(response.body.data.rating).toBe(sampleMovie.rating);
      expect(response.body.data._id).toBeDefined();

      movieId = response.body.data._id;
    });

    it('should create a movie with only required fields', async () => {
      const minimalMovie = {
        title: 'Minimal Movie'
      };

      const response = await request(app)
        .post('/api/v1/movies')
        .send(minimalMovie)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(minimalMovie.title);
    });

    it('should return validation error for missing title', async () => {
      const invalidMovie = {
        director: 'Some Director',
        releaseYear: 2023
      };

      const response = await request(app)
        .post('/api/v1/movies')
        .send(invalidMovie)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toBeDefined();
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    it('should return validation error for invalid rating', async () => {
      const invalidMovie = {
        title: 'Test Movie',
        rating: 15
      };

      const response = await request(app)
        .post('/api/v1/movies')
        .send(invalidMovie)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });

    it('should return validation error for invalid release year', async () => {
      const invalidMovie = {
        title: 'Test Movie',
        releaseYear: 1500
      };

      const response = await request(app)
        .post('/api/v1/movies')
        .send(invalidMovie)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('GET /api/v1/movies', () => {
    beforeEach(async () => {
      // Create test movies
      await Movie.create([sampleMovie, sampleMovie2]);
    });

    it('should get all movies with default pagination', async () => {
      const response = await request(app)
        .get('/api/v1/movies')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(10);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should get movies with custom pagination', async () => {
      const response = await request(app)
        .get('/api/v1/movies?page=1&limit=1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(1);
    });

    it('should filter movies by genre', async () => {
      const response = await request(app)
        .get('/api/v1/movies?genre=Drama')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      response.body.data.forEach(movie => {
        expect(movie.genre.toLowerCase()).toContain('drama');
      });
    });

    it('should filter movies by director', async () => {
      const response = await request(app)
        .get('/api/v1/movies?director=Frank')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      response.body.data.forEach(movie => {
        expect(movie.director.toLowerCase()).toContain('frank');
      });
    });

    it('should filter movies by rating range', async () => {
      const response = await request(app)
        .get('/api/v1/movies?minRating=9&maxRating=10')
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.forEach(movie => {
        expect(movie.rating).toBeGreaterThanOrEqual(9);
        expect(movie.rating).toBeLessThanOrEqual(10);
      });
    });

    it('should sort movies by rating descending', async () => {
      const response = await request(app)
        .get('/api/v1/movies?sortBy=rating&sortOrder=desc')
        .expect(200);

      expect(response.body.success).toBe(true);
      if (response.body.data.length > 1) {
        for (let i = 0; i < response.body.data.length - 1; i++) {
          expect(response.body.data[i].rating).toBeGreaterThanOrEqual(
            response.body.data[i + 1].rating
          );
        }
      }
    });

    it('should return validation error for invalid pagination parameters', async () => {
      const response = await request(app)
        .get('/api/v1/movies?page=0')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('GET /api/v1/movies/:id', () => {
    beforeEach(async () => {
      const movie = await Movie.create(sampleMovie);
      movieId = movie._id.toString();
    });

    it('should get a movie by valid ID', async () => {
      const response = await request(app)
        .get(`/api/v1/movies/${movieId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(movieId);
      expect(response.body.data.title).toBe(sampleMovie.title);
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request(app)
        .get('/api/v1/movies/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid movie ID format');
    });

    it('should return 404 for non-existent movie', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/v1/movies/${nonExistentId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Movie not found');
    });
  });

  describe('PUT /api/v1/movies/:id', () => {
    beforeEach(async () => {
      const movie = await Movie.create(sampleMovie);
      movieId = movie._id.toString();
    });

    it('should update a movie successfully', async () => {
      const updateData = {
        title: 'Updated Movie Title',
        rating: 9.5
      };

      const response = await request(app)
        .put(`/api/v1/movies/${movieId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Movie updated successfully');
      expect(response.body.data.title).toBe(updateData.title);
      expect(response.body.data.rating).toBe(updateData.rating);
      expect(response.body.data.director).toBe(sampleMovie.director); // Should remain unchanged
    });

    it('should update only specified fields', async () => {
      const updateData = {
        rating: 8.5
      };

      const response = await request(app)
        .put(`/api/v1/movies/${movieId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.rating).toBe(updateData.rating);
      expect(response.body.data.title).toBe(sampleMovie.title); // Should remain unchanged
    });

    it('should return validation error for invalid data', async () => {
      const invalidUpdateData = {
        rating: 15
      };

      const response = await request(app)
        .put(`/api/v1/movies/${movieId}`)
        .send(invalidUpdateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request(app)
        .put('/api/v1/movies/invalid-id')
        .send({ title: 'Updated Title' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid movie ID format');
    });

    it('should return 404 for non-existent movie', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/v1/movies/${nonExistentId}`)
        .send({ title: 'Updated Title' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Movie not found');
    });

    it('should return 400 for empty request body', async () => {
      const response = await request(app)
        .put(`/api/v1/movies/${movieId}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Request body cannot be empty');
    });
  });

  describe('DELETE /api/v1/movies/:id', () => {
    beforeEach(async () => {
      const movie = await Movie.create(sampleMovie);
      movieId = movie._id.toString();
    });

    it('should delete a movie successfully', async () => {
      const response = await request(app)
        .delete(`/api/v1/movies/${movieId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Movie deleted successfully');
      expect(response.body.data._id).toBe(movieId);

      // Verify the movie is actually deleted
      const deletedMovie = await Movie.findById(movieId);
      expect(deletedMovie).toBeNull();
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request(app)
        .delete('/api/v1/movies/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid movie ID format');
    });

    it('should return 404 for non-existent movie', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/v1/movies/${nonExistentId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Movie not found');
    });
  });

  describe('GET /api/v1/movies/search', () => {
    beforeEach(async () => {
      await Movie.create([sampleMovie, sampleMovie2]);
    });

    it('should search movies by title', async () => {
      const response = await request(app)
        .get('/api/v1/movies/search?search=Shawshank')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].title.toLowerCase()).toContain('shawshank');
    });

    it('should return empty results for non-matching search', async () => {
      const response = await request(app)
        .get('/api/v1/movies/search?search=NonExistentMovie')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(0);
    });

    it('should return 400 for missing search term', async () => {
      const response = await request(app)
        .get('/api/v1/movies/search')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Search term is required');
    });

    it('should search with pagination', async () => {
      const response = await request(app)
        .get('/api/v1/movies/search?search=The&page=1&limit=1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(1);
    });
  });

  describe('GET /api/v1/movies/stats', () => {
    beforeEach(async () => {
      await Movie.create([sampleMovie, sampleMovie2]);
    });

    it('should get movie statistics', async () => {
      const response = await request(app)
        .get('/api/v1/movies/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.totalMovies).toBeGreaterThan(0);
      expect(response.body.data.averageRating).toBeDefined();
      expect(response.body.data.highestRating).toBeDefined();
      expect(response.body.data.lowestRating).toBeDefined();
    });
  });

  describe('GET /api/v1/movies/genre/:genre', () => {
    beforeEach(async () => {
      await Movie.create([sampleMovie, sampleMovie2]);
    });

    it('should get movies by genre', async () => {
      const response = await request(app)
        .get('/api/v1/movies/genre/Drama')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      if (response.body.data.length > 0) {
        expect(response.body.data[0].genre.toLowerCase()).toContain('drama');
      }
    });

    it('should return empty array for non-existent genre', async () => {
      const response = await request(app)
        .get('/api/v1/movies/genre/NonExistentGenre')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/v1/nonexistent')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Route not found');
    });

    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/v1/movies')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('OK');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.uptime).toBeDefined();
    });
  });
});