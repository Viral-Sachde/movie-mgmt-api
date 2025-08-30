const movieDao = require('../dao/movieDao');
const { validateMovieInput, validatePaginationParams } = require('../validators/movieValidator');

class MovieService {

    // Get all movies with pagination and filtering

  async getAllMovies(queryParams) {
    try {
      const { page, limit, sortBy, sortOrder, genre, director, minRating, maxRating, year } = queryParams;
      
      // Validate pagination parameters
      const paginationParams = validatePaginationParams({ page, limit });
      
      // Build filter object
      const filter = {};
      if (genre) filter.genre = new RegExp(genre, 'i');
      if (director) filter.director = new RegExp(director, 'i');
      if (year) filter.releaseYear = parseInt(year);
      
      if (minRating || maxRating) {
        filter.rating = {};
        if (minRating) filter.rating.$gte = parseFloat(minRating);
        if (maxRating) filter.rating.$lte = parseFloat(maxRating);
      }

      // Build sort object
      const sort = {};
      if (sortBy) {
        const order = sortOrder === 'desc' ? -1 : 1;
        sort[sortBy] = order;
      } else {
        sort.createdAt = -1; // Default sort by creation date
      }

      const options = {
        page: paginationParams.page,
        limit: paginationParams.limit,
        filter,
        sort
      };

      const result = await movieDao.getAllMovies(options);
      
      return {
        success: true,
        data: result.movies,
        pagination: result.pagination
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }


  //  Get a movie by ID

  async getMovieById(id) {
    try {
      if (!id) {
        return {
          success: false,
          message: 'Movie ID is required'
        };
      }

      const movie = await movieDao.getMovieById(id);
      
      if (!movie) {
        return {
          success: false,
          message: 'Movie not found'
        };
      }

      return {
        success: true,
        data: movie
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

 
  //  Create a new movie
  
  async createMovie(movieData) {
    try {
      // Validate input data
      const { error, value } = validateMovieInput(movieData);
      if (error) {
        return {
          success: false,
          message: 'Validation failed',
          errors: error.details.map(detail => detail.message)
        };
      }

      const createdMovie = await movieDao.createMovie(value);
      
      return {
        success: true,
        data: createdMovie,
        message: 'Movie created successfully'
      };
    } catch (error) {
      if (error.name === 'ValidationError') {
        return {
          success: false,
          message: 'Validation failed',
          errors: error.errors
        };
      }
      
      return {
        success: false,
        message: error.message
      };
    }
  }

  
    // Update a movie by ID
  
  async updateMovie(id, updateData) {
    try {
      if (!id) {
        return {
          success: false,
          message: 'Movie ID is required'
        };
      }

      // Validate input data (partial update allowed)
      const { error, value } = validateMovieInput(updateData, { allowUnknown: false, stripUnknown: true });
      if (error) {
        return {
          success: false,
          message: 'Validation failed',
          errors: error.details.map(detail => detail.message)
        };
      }

      const updatedMovie = await movieDao.updateMovie(id, value);
      
      if (!updatedMovie) {
        return {
          success: false,
          message: 'Movie not found'
        };
      }

      return {
        success: true,
        data: updatedMovie,
        message: 'Movie updated successfully'
      };
    } catch (error) {
      if (error.name === 'ValidationError') {
        return {
          success: false,
          message: 'Validation failed',
          errors: error.errors
        };
      }
      
      return {
        success: false,
        message: error.message
      };
    }
  }


  //  Delete a movie by ID
  
  async deleteMovie(id) {
    try {
      if (!id) {
        return {
          success: false,
          message: 'Movie ID is required'
        };
      }

      const deletedMovie = await movieDao.deleteMovie(id);
      
      if (!deletedMovie) {
        return {
          success: false,
          message: 'Movie not found'
        };
      }

      return {
        success: true,
        data: deletedMovie,
        message: 'Movie deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  
// Search movies by title
  
  async searchMovies(searchTerm, queryParams) {
    try {
      if (!searchTerm || searchTerm.trim().length === 0) {
        return {
          success: false,
          message: 'Search term is required'
        };
      }

      const { page, limit } = queryParams;
      const paginationParams = validatePaginationParams({ page, limit });

      const options = {
        page: paginationParams.page,
        limit: paginationParams.limit
      };

      const result = await movieDao.searchMoviesByTitle(searchTerm.trim(), options);
      
      return {
        success: true,
        data: result.movies,
        pagination: result.pagination
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  
  //  Get movies by genre

  async getMoviesByGenre(genre) {
    try {
      if (!genre) {
        return {
          success: false,
          message: 'Genre is required'
        };
      }

      const movies = await movieDao.getMoviesByGenre(genre);
      
      return {
        success: true,
        data: movies
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  
   // Get movie statistics
  
  async getMovieStats() {
    try {
      const stats = await movieDao.getMovieStats();
      
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }
}

module.exports = new MovieService();