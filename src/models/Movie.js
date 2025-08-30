const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  director: {
    type: String,
    trim: true,
    maxlength: [100, 'Director name cannot exceed 100 characters']
  },
  releaseYear: {
    type: Number,
    min: [1800, 'Release year must be after 1800'],
    max: [2100, 'Release year cannot be in the future beyond 2100'],
    validate: {
      validator: Number.isInteger,
      message: 'Release year must be a valid integer'
    }
  },
  genre: {
    type: String,
    trim: true,
    maxlength: [50, 'Genre cannot exceed 50 characters']
  },
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [10, 'Rating cannot exceed 10'],
    validate: {
      validator: function(value) {
        return value === undefined || (value >= 1 && value <= 10);
      },
      message: 'Rating must be between 1 and 10'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
movieSchema.index({ title: 1 });
movieSchema.index({ director: 1 });
movieSchema.index({ genre: 1 });
movieSchema.index({ releaseYear: -1 });
movieSchema.index({ rating: -1 });

// Virtual for formatted rating
movieSchema.virtual('formattedRating').get(function() {
  return this.rating ? this.rating.toFixed(1) : 'Not Rated';
});

// Instance method to get movie summary
movieSchema.methods.getSummary = function() {
  return `${this.title} (${this.releaseYear || 'Unknown'}) - Directed by ${this.director || 'Unknown'} - Rating: ${this.formattedRating}`;
};

// Static method to find by genre
movieSchema.statics.findByGenre = function(genre) {
  return this.find({ genre: new RegExp(genre, 'i') });
};

// Pre-save middleware for data normalization
movieSchema.pre('save', function(next) {
  if (this.title) {
    this.title = this.title.trim();
  }
  if (this.director) {
    this.director = this.director.trim();
  }
  if (this.genre) {
    this.genre = this.genre.trim();
  }
  next();
});

const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;