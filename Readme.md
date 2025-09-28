# Millennium Falcon Backend - Technical Test

## Quick Start

### Prerequisites

- Docker installed on your laptop
- Port 3000 available

### Option A: Use Pre-built Docker Image (Fastest) ⚡

```bash
# Run directly from Docker Hub
docker run -p 3000:3000 moulee23/millennium-falcon-backend
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
   docker run -p 3000:3000 millennium-falcon-backend
   ```

### Test the API 🧪

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

## Available Planets

- Tatooine (departure)
- Dagobah
- Endor
- Hoth
