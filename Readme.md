# Millennium Falcon Backend - Technical Test

## Quick Start

### Prerequisites

- Docker installed on your laptop
- Port 3001 available

### Option A: Use Pre-built Docker Image (Fastest) ⚡

```bash
# Run directly from Docker Hub
docker run -p 3001:3001 moulee23/millennium-falcon-backend
```

### Option B: Build from Source 🔨

1. **Clone the repository:**

   ```bash
   git clone https://github.com/gmoulee/Millennium-Falcon.git
   cd Millennium-Falcon
   ```

2. **Build the Docker image:**

   ```bash
   docker build -t millennium-falcon-backend .
   ```

3. **Run the container:**

   ```bash
   docker run -p 3001:3001 millennium-falcon-backend
   ```

### Test the API 🧪

```bash
# Health check
curl http://localhost:3001/health

# Readiness check
curl http://localhost:3001/ready

# Route computation
curl -X POST http://localhost:3001/compute \
  -H "Content-Type: application/json" \
  -d '{"arrival": "Endor"}'
```

## API Documentation 📚

Interactive API documentation is available at:

- **Swagger UI**: http://localhost:3001/api-docs
- **OpenAPI JSON**: http://localhost:3001/api-docs.json

## API Endpoints

### Health Endpoints

- `GET /health` - Health check endpoint
  - Returns service status, uptime, memory usage, and system information
- `GET /ready` - Readiness check endpoint
  - Returns service readiness status

### Route Endpoints

- `POST /compute` - Route computation
  - **Request**: `{"arrival": "Endor"}`
  - **Response**: `{"duration": 8, "route": ["Tatooine", "Hoth", "Endor"]}`
  - **Error Responses**:
    - `400` - Bad Request (invalid input)
    - `404` - Not Found (no route available)
    - `500` - Internal Server Error

## Available Planets

- **Tatooine** (departure planet)
- **Dagobah**
- **Endor**
- **Hoth**
