# Movie Mgmt API

A REST API for managing movies built with Node.js, Express, and MongoDB. Pretty straightforward stuff.

## What it does

Basic CRUD operations for movies - create, read, update, delete. You can also search movies by title, filter by genre/director/rating/year, and it comes with pagination so you don't crash your browser loading thousands of movies at once.

Has proper validation so people can't send garbage data, error handling that actually makes sense, auto-generated docs with Swagger, and tests that actually work.

## Tech stuff

- Node.js + Express for the backend
- MongoDB with Mongoose for data
- Joi for validation (so users can't break things)
- Jest + Supertest for testing
- Swagger for docs
- Basic security with Helmet and CORS
- Morgan for logging
- dotenv for config

## How it's organized

```
movie-mgmt-api/
├── src/
│   ├── config/           # Database and Swagger setup
│   ├── controllers/      # Handles HTTP requests
│   ├── dao/             # Database queries
│   ├── middleware/      # Error handling
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── services/        # Business logic
│   ├── validators/      # Input validation
│   └── server.js        # Main app file
├── tests/               # Unit and integration tests
├── .env                 # Environment config
└── package.json
```

Standard layered architecture - controllers handle requests, services do the business logic, DAO talks to the database. Clean separation so you don't go insane debugging later.

## API endpoints

### Movies
- GET `/api/v1/movies` - Get all movies (with filtering and pagination)
- GET `/api/v1/movies/:id` - Get one movie
- POST `/api/v1/movies` - Create new movie
- PUT `/api/v1/movies/:id` - Update existing movie
- DELETE `/api/v1/movies/:id` - Delete movie
- GET `/api/v1/movies/search` - Search by title
- GET `/api/v1/movies/stats` - Get some stats
- GET `/api/v1/movies/genre/:genre` - Get movies by genre

### Other stuff
- GET `/health` - Check if API is alive
- GET `/api-docs` - Swagger documentation

## Movie schema

```json
{
  "_id": "auto-generated",
  "title": "required string",
  "director": "optional string",
  "releaseYear": "optional number (1800-2100)",
  "genre": "optional string",
  "rating": "optional number (1-10)",
  "createdAt": "auto timestamp",
  "updatedAt": "auto timestamp"
}
```

## Setup

You'll need Node.js and MongoDB installed. Pretty standard stuff.

1. Clone this repo
   ```bash
   git clone <repo-url>
   cd movie-mgmt-api
   ```

2. Install deps
   ```bash
   npm install
   ```

3. Configure your .env file
   ```env
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/movie_management_db
   API_VERSION=v1
   API_PREFIX=/api
   DEFAULT_PAGE_SIZE=10
   MAX_PAGE_SIZE=100
   ```

4. Start MongoDB (locally or use Atlas)

5. Run the app
   
   Dev mode (with auto-restart):
   ```bash
   npm run dev
   ```
   
   Prod mode:
   ```bash
   npm start
   ```

Server runs on http://localhost:3000

Check out the Swagger docs at http://localhost:3000/api-docs once it's running.

## Testing

```bash
npm test
```

Tests use MongoDB Memory Server so they don't mess with your actual database. Includes unit tests for business logic and integration tests for the full API.

## Example usage

### Adding a movie
```bash
curl -X POST http://localhost:3000/api/v1/movies \
  -H "Content-Type: application/json" \
  -d '{
    "title": "The Matrix",
    "director": "The Wachowskis",
    "releaseYear": 1999,
    "genre": "Sci-Fi",
    "rating": 8.7
  }'
```

### Getting movies with filters
```bash
curl "http://localhost:3000/api/v1/movies?genre=Action&minRating=8&page=1&limit=5"
```

### Searching
```bash
curl "http://localhost:3000/api/v1/movies/search?search=Matrix"
```

## Query options

### Pagination
- page - which page (starts at 1)
- limit - how many per page (max 100)

### Filters
- genre - filter by genre
- director - filter by director
- minRating/maxRating - rating range
- year - specific release year

### Sorting
- sortBy - field to sort by (title, director, releaseYear, genre, rating, createdAt)
- sortOrder - asc or desc

All filtering is case-insensitive and uses partial matching where it makes sense.

## Performance stuff

Has proper database indexing, pagination for large datasets, lean queries for better performance, and connection pooling. Should handle decent traffic without choking.

## Security

Basic security headers with Helmet, CORS configured, input validation on everything, sanitized error messages in prod, and protection against MongoDB injection attacks.

## Environment vars

- PORT - server port (default 3000)
- NODE_ENV - dev/prod mode
- MONGODB_URI - database connection string
- API_VERSION - API version (default v1)
- API_PREFIX - route prefix (default /api)
- DEFAULT_PAGE_SIZE - default pagination size (10)
- MAX_PAGE_SIZE - max items per page (100)

## Contributing

Standard GitHub workflow - fork, branch, commit, push, PR. Pretty straightforward.