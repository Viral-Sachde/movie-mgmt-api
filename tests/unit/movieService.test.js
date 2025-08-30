const movieService = require('../../src/services/movieService');
const movieDao = require('../../src/dao/movieDao');
const Movie = require('../../src/models/Movie');

// Mock the movieDao
jest.mock('../../src/dao/movieDao');

describe('MovieService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllMovies', () => {
    it('should return all movies with pagination', async () => {
      const mockMovies = [
        {
          _id: '507f1f77bcf86cd799439011',
          title: 'The Shawshank Redemption',
          director: 'Frank Darabont',
          releaseYear: 1994,
          genre: 'Drama',
          rating: 9.3
        }
      ];

      const mockResult = {
        movies: mockMovies,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          pages: 1
        }
      };

      movieDao.getAllMovies.mockResolvedValue(mockResult);

      const result = await movieService.getAllMovies({ page: 1, limit: 10 });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockMovies);
      expect(result.pagination).toEqual(mockResult.pagination);
      expect(movieDao.getAllMovies).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        filter: {},
        sort: { createdAt: -1 }
      });
    });

    it('should handle filtering parameters', async () => {
      const queryParams = {
        genre: 'Drama',
        director: 'Frank',
        minRating: 8.0,
        maxRating: 10.0,
        year: 1994
      };

      movieDao.getAllMovies.mockResolvedValue({
        movies: [],
        pagination: { page: 1, limit: 10, total: 0, pages: 0 }
      });

      await movieService.getAllMovies(queryParams);

      expect(movieDao.getAllMovies).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        filter: {
          genre: expect.any(RegExp),
          director: expect.any(RegExp),
          releaseYear: 1994,
          rating: { $gte: 8.0, $lte: 10.0 }
        },
        sort: { createdAt: -1 }
      });
    });

    it('should handle sorting parameters', async () => {
      const queryParams = {
        sortBy: 'rating',
        sortOrder: 'desc'
      };

      movieDao.getAllMovies.mockResolvedValue({
        movies: [],
        pagination: { page: 1, limit: 10, total: 0, pages: 0 }
      });

      await movieService.getAllMovies(queryParams);

      expect(movieDao.getAllMovies).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        filter: {},
        sort: { rating: -1 }
      });
    });

    it('should handle errors from DAO', async () => {
      movieDao.getAllMovies.mockRejectedValue(new Error('Database error'));

      const result = await movieService.getAllMovies({});

      expect(result.success).toBe(false);
      expect(result.message).toBe('Database error');
    });
  });

  describe('getMovieById', () => {
    it('should return a movie by ID', async () => {
      const mockMovie = {
        _id: '507f1f77bcf86cd799439011',
        title: 'The Shawshank Redemption',
        director: 'Frank Darabont',
        releaseYear: 1994,
        genre: 'Drama',
        rating: 9.3
      };

      movieDao.getMovieById.mockResolvedValue(mockMovie);

      const result = await movieService.getMovieById('507f1f77bcf86cd799439011');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockMovie);
      expect(movieDao.getMovieById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should return error when movie not found', async () => {
      movieDao.getMovieById.mockResolvedValue(null);

      const result = await movieService.getMovieById('507f1f77bcf86cd799439011');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Movie not found');
    });

    it('should return error when ID is missing', async () => {
      const result = await movieService.getMovieById(null);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Movie ID is required');
    });

    it('should handle DAO errors', async () => {
      movieDao.getMovieById.mockRejectedValue(new Error('Database error'));

      const result = await movieService.getMovieById('507f1f77bcf86cd799439011');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Database error');
    });
  });

  describe('createMovie', () => {
    it('should create a new movie successfully', async () => {
      const movieData = {
        title: 'The Shawshank Redemption',
        director: 'Frank Darabont',
        releaseYear: 1994,
        genre: 'Drama',
        rating: 9.3
      };

      const mockCreatedMovie = {
        _id: '507f1f77bcf86cd799439011',
        ...movieData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      movieDao.createMovie.mockResolvedValue(mockCreatedMovie);

      const result = await movieService.createMovie(movieData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCreatedMovie);
      expect(result.message).toBe('Movie created successfully');
      expect(movieDao.createMovie).toHaveBeenCalledWith(movieData);
    });

    it('should return validation error for invalid data', async () => {
      const invalidMovieData = {
        title: '', // Empty title should fail validation
        rating: 11 // Rating above 10 should fail
      };

      const result = await movieService.createMovie(invalidMovieData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Validation failed');
      expect(result.errors).toBeDefined();
      expect(Array.isArray(result.errors)).toBe(true);
    });

    it('should handle DAO validation errors', async () => {
      const movieData = {
        title: 'Valid Title'
      };

      const validationError = new Error('Validation failed');
      validationError.name = 'ValidationError';
      validationError.errors = ['Title is required'];

      movieDao.createMovie.mockRejectedValue(validationError);

      const result = await movieService.createMovie(movieData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Validation failed');
      expect(result.errors).toEqual(['Title is required']);
    });

    it('should handle other DAO errors', async () => {
      const movieData = {
        title: 'Valid Title'
      };

      movieDao.createMovie.mockRejectedValue(new Error('Database connection failed'));

      const result = await movieService.createMovie(movieData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Database connection failed');
    });
  });

  describe('updateMovie', () => {
    it('should update a movie successfully', async () => {
      const movieId = '507f1f77bcf86cd799439011';
      const updateData = {
        title: 'Updated Title',
        rating: 9.5
      };

      const mockUpdatedMovie = {
        _id: movieId,
        title: 'Updated Title',
        director: 'Frank Darabont',
        releaseYear: 1994,
        genre: 'Drama',
        rating: 9.5,
        updatedAt: new Date()
      };

      movieDao.updateMovie.mockResolvedValue(mockUpdatedMovie);

      const result = await movieService.updateMovie(movieId, updateData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUpdatedMovie);
      expect(result.message).toBe('Movie updated successfully');
      expect(movieDao.updateMovie).toHaveBeenCalledWith(movieId, updateData);
    });

    it('should return error when movie not found', async () => {
      movieDao.updateMovie.mockResolvedValue(null);

      const result = await movieService.updateMovie('507f1f77bcf86cd799439011', { title: 'New Title' });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Movie not found');
    });

    it('should return error when ID is missing', async () => {
      const result = await movieService.updateMovie(null, { title: 'New Title' });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Movie ID is required');
    });

    it('should handle validation errors', async () => {
      const updateData = {
        rating: 15 // Invalid rating
      };

      const result = await movieService.updateMovie('507f1f77bcf86cd799439011', updateData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Validation failed');
      expect(result.errors).toBeDefined();
    });
  });

  describe('deleteMovie', () => {
    it('should delete a movie successfully', async () => {
      const movieId = '507f1f77bcf86cd799439011';
      const mockDeletedMovie = {
        _id: movieId,
        title: 'The Shawshank Redemption',
        director: 'Frank Darabont',
        releaseYear: 1994,
        genre: 'Drama',
        rating: 9.3
      };

      movieDao.deleteMovie.mockResolvedValue(mockDeletedMovie);

      const result = await movieService.deleteMovie(movieId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockDeletedMovie);
      expect(result.message).toBe('Movie deleted successfully');
      expect(movieDao.deleteMovie).toHaveBeenCalledWith(movieId);
    });

    it('should return error when movie not found', async () => {
      movieDao.deleteMovie.mockResolvedValue(null);

      const result = await movieService.deleteMovie('507f1f77bcf86cd799439011');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Movie not found');
    });

    it('should return error when ID is missing', async () => {
      const result = await movieService.deleteMovie(null);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Movie ID is required');
    });

    it('should handle DAO errors', async () => {
      movieDao.deleteMovie.mockRejectedValue(new Error('Database error'));

      const result = await movieService.deleteMovie('507f1f77bcf86cd799439011');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Database error');
    });
  });

  describe('searchMovies', () => {
    it('should search movies by title successfully', async () => {
      const searchTerm = 'Shawshank';
      const mockSearchResult = {
        movies: [
          {
            _id: '507f1f77bcf86cd799439011',
            title: 'The Shawshank Redemption',
            director: 'Frank Darabont',
            releaseYear: 1994,
            genre: 'Drama',
            rating: 9.3
          }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          pages: 1
        }
      };

      movieDao.searchMoviesByTitle.mockResolvedValue(mockSearchResult);

      const result = await movieService.searchMovies(searchTerm, { page: 1, limit: 10 });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockSearchResult.movies);
      expect(result.pagination).toEqual(mockSearchResult.pagination);
      expect(movieDao.searchMoviesByTitle).toHaveBeenCalledWith(searchTerm, {
        page: 1,
        limit: 10
      });
    });

    it('should return error for empty search term', async () => {
      const result = await movieService.searchMovies('', {});

      expect(result.success).toBe(false);
      expect(result.message).toBe('Search term is required');
    });

    it('should return error for null search term', async () => {
      const result = await movieService.searchMovies(null, {});

      expect(result.success).toBe(false);
      expect(result.message).toBe('Search term is required');
    });

    it('should handle DAO errors', async () => {
      movieDao.searchMoviesByTitle.mockRejectedValue(new Error('Search failed'));

      const result = await movieService.searchMovies('test', {});

      expect(result.success).toBe(false);
      expect(result.message).toBe('Search failed');
    });
  });
});