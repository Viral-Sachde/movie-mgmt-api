const Movie = require('../models/Movie');

class MovieDAO {
  
   // Get all movies with pagination and optional filtering
  
  async getAllMovies(options = {}) {
    try {
      const {
        page = 1,
        limit = parseInt(process.env.DEFAULT_PAGE_SIZE) || 10,
        filter = {},
        sort = { createdAt: -1 }
      } = options;

      const skip = (page - 1) * limit;
      
      const [movies, total] = await Promise.all([
        Movie.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        Movie.countDocuments(filter)
      ]);

      return {
        movies,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Error fetching movies: ${error.message}`);
    }
  }

  
   //Get a movie by ID

  async getMovieById(id) {
    try {
      return await Movie.findById(id).lean();
    } catch (error) {
      if (error.name === 'CastError') {
        return null;
      }
      throw new Error(`Error fetching movie: ${error.message}`);
    }
  }

  
   // Create a new movie
  
  async createMovie(movieData) {
    try {
      const movie = new Movie(movieData);
      return await movie.save();
    } catch (error) {
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        const validationError = new Error('Validation failed');
        validationError.name = 'ValidationError';
        validationError.errors = errors;
        throw validationError;
      }
      throw new Error(`Error creating movie: ${error.message}`);
    }
  }

  
   //Update a movie by ID
  
  async updateMovie(id, updateData) {
    try {
      const updatedMovie = await Movie.findByIdAndUpdate(
        id,
        updateData,
        {
          new: true,
          runValidators: true,
          lean: true
        }
      );
      return updatedMovie;
    } catch (error) {
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        const validationError = new Error('Validation failed');
        validationError.name = 'ValidationError';
        validationError.errors = errors;
        throw validationError;
      }
      if (error.name === 'CastError') {
        return null;
      }
      throw new Error(`Error updating movie: ${error.message}`);
    }
  }

  
   // Delete a movie by ID
   
  async deleteMovie(id) {
    try {
      return await Movie.findByIdAndDelete(id).lean();
    } catch (error) {
      if (error.name === 'CastError') {
        return null;
      }
      throw new Error(`Error deleting movie: ${error.message}`);
    }
  }

  
  //Search movies by title

  async searchMoviesByTitle(searchTerm, options = {}) {
    try {
      const {
        page = 1,
        limit = parseInt(process.env.DEFAULT_PAGE_SIZE) || 10,
        sort = { createdAt: -1 }
      } = options;

      const skip = (page - 1) * limit;
      const filter = {
        title: { $regex: searchTerm, $options: 'i' }
      };

      const [movies, total] = await Promise.all([
        Movie.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        Movie.countDocuments(filter)
      ]);

      return {
        movies,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Error searching movies: ${error.message}`);
    }
  }

  
   //Get movies by genre

  async getMoviesByGenre(genre) {
    try {
      return await Movie.findByGenre(genre).lean();
    } catch (error) {
      throw new Error(`Error fetching movies by genre: ${error.message}`);
    }
  }

  
   // Get movie statistics

  async getMovieStats() {
    try {
      const stats = await Movie.aggregate([
        {
          $group: {
            _id: null,
            totalMovies: { $sum: 1 },
            averageRating: { $avg: '$rating' },
            highestRating: { $max: '$rating' },
            lowestRating: { $min: '$rating' },
            latestYear: { $max: '$releaseYear' },
            oldestYear: { $min: '$releaseYear' }
          }
        }
      ]);

      return stats[0] || {
        totalMovies: 0,
        averageRating: 0,
        highestRating: 0,
        lowestRating: 0,
        latestYear: null,
        oldestYear: null
      };
    } catch (error) {
      throw new Error(`Error fetching movie statistics: ${error.message}`);
    }
  }
}

module.exports = new MovieDAO();