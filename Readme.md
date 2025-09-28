# Millennium Falcon Backend - Technical Test

## Quick Start

### Prerequisites

- Docker installed on your laptop
- Port 3000 available

### Build and Run

1. **Build the Docker image:**

   ```bash
   docker build -t millennium-falcon-backend .
   ```

2. **Run the container:**

   ```bash
   docker run -p 3000:3000 millennium-falcon-backend
   ```

3. **Test the API:**

   ```bash
   # Health check
   curl http://localhost:3000/health

   # Route computation
   curl -X POST http://localhost:3000/compute \
     -H "Content-Type: application/json" \
     -d '{"arrival": "Endor"}'
   ```

## API Endpoints

- `GET /health` - Health check endpoint
- `POST /compute` - Route computation
  - Request: `{"arrival": "Endor"}`
  - Response: `{"duration": 8, "route": ["Tatooine", "Hoth", "Endor"]}`

## Technical Highlights

- **TypeScript** with strict type checking
- **Async/await** database operations (migrated from callback-based sqlite3)
- **SQLite** database with Promise-based sqlite library
- **Docker** containerization with security best practices
- **Comprehensive testing** (133 tests passing)
- **Clean architecture** with proper separation of concerns

## Available Planets

- Tatooine (departure)
- Dagobah
- Endor
- Hoth
