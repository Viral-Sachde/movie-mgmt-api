const movieService = require('../services/movieService');
const { validateObjectId } = require('../validators/movieValidator');

class MovieController {
 
   //Get all movies with pagination and filtering
  
  async getAllMovies(req, res) {
    try {
      const result = await movieService.getAllMovies(req.query);
      
      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  
   // Get a movie by ID
  
  async getMovieById(req, res) {
    try {
      const { id } = req.params;

      // Validate ObjectId format
      if (!validateObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid movie ID format'
        });
      }

      const result = await movieService.getMovieById(id);
      
      if (!result.success) {
        return res.status(404).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }


   // Create a new movie
  
  async createMovie(req, res) {
    try {
      const result = await movieService.createMovie(req.body);
      
      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

 
   // Update a movie by ID
  
  async updateMovie(req, res) {
    try {
      const { id } = req.params;

      // Validate ObjectId format
      if (!validateObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid movie ID format'
        });
      }

      // Check if request body is empty
      if (Object.keys(req.body).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Request body cannot be empty'
        });
      }

      const result = await movieService.updateMovie(id, req.body);
      
      if (!result.success) {
        const statusCode = result.message === 'Movie not found' ? 404 : 400;
        return res.status(statusCode).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

 
   // Delete a movie by ID
  
  async deleteMovie(req, res) {
    try {
      const { id } = req.params;

      // Validate ObjectId format
      if (!validateObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid movie ID format'
        });
      }

      const result = await movieService.deleteMovie(id);
      
      if (!result.success) {
        return res.status(404).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }


  // Search movies by title
  
  async searchMovies(req, res) {
    try {
      const { search } = req.query;

      if (!search) {
        return res.status(400).json({
          success: false,
          message: 'Search term is required'
        });
      }

      const result = await movieService.searchMovies(search, req.query);
      
      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }


 //   Get movies by genre

  async getMoviesByGenre(req, res) {
    try {
      const { genre } = req.params;

      if (!genre) {
        return res.status(400).json({
          success: false,
          message: 'Genre is required'
        });
      }

      const result = await movieService.getMoviesByGenre(genre);
      
      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

 
   //Get movie statistics

  async getMovieStats(req, res) {
    try {
      const result = await movieService.getMovieStats();
      
      if (!result.success) {
        return res.status(500).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new MovieController();