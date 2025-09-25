# QuickNotes Backend API

A scalable backend API for the QuickNotes mini SaaS application built with Node.js, Express, PostgreSQL, and Redis.

## Features

- **User Management**: Registration, login with JWT authentication
- **Notes CRUD**: Create, read, update, delete personal notes
- **Tagging System**: Organize notes with tags and search functionality
- **Redis Caching**: Fast search results with Redis cache
- **Health Checks**: Comprehensive health monitoring endpoints
- **Metrics**: Prometheus-compatible metrics for monitoring
- **Load Balancing**: NGINX load balancer with 2 API instances
- **Containerized**: Fully dockerized with Docker Compose

## Architecture

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────┐
│   Load Balancer │    │  API Instance│    │ PostgreSQL  │
│     (NGINX)     │◄──►│      1       │◄──►│  Database   │
│   Port: 8080    │    │  Port: 3000  │    │ Port: 5432  │
└─────────────────┘    └──────────────┘    └─────────────┘
                              │
                       ┌──────────────┐    ┌─────────────┐
                       │  API Instance│    │    Redis    │
                       │      2       │◄──►│    Cache    │
                       │  Port: 3000  │    │ Port: 6379  │
                       └──────────────┘    └─────────────┘
```

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Make (optional, for convenient commands)

### Setup

1. **Clone and setup environment**:
   ```bash
   # Copy environment file
   cp env.example .env
   
   # Edit .env with your configuration
   nano .env
   ```

2. **Start the application**:
   ```bash
   # Using Make (recommended)
   make setup
   make build
   make up
   
   # Or using Docker Compose directly
   docker-compose up -d --build
   ```

3. **Verify installation**:
   ```bash
   # Check health
   curl http://localhost:8080/health
   
   # Or using Make
   make health
   ```

The API will be available at: **http://localhost:8080**

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/verify` | Verify JWT token |

### Notes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notes` | Get user's notes (with pagination) |
| GET | `/api/notes/:id` | Get specific note |
| POST | `/api/notes` | Create new note |
| PUT | `/api/notes/:id` | Update note |
| DELETE | `/api/notes/:id` | Delete note |
| GET | `/api/notes/search` | Search notes by tags |
| GET | `/api/notes/tags` | Get user's tags |

### Health & Monitoring

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Basic health check |
| GET | `/health/detailed` | Detailed health with dependencies |
| GET | `/health/ready` | Readiness probe |
| GET | `/health/live` | Liveness probe |
| GET | `/metrics` | Prometheus metrics |

## API Usage Examples

### Register User
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Create Note
```bash
curl -X POST http://localhost:8080/api/notes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "My First Note",
    "content": "This is the content of my note",
    "tags": ["work", "ideas"]
  }'
```

### Search Notes by Tags
```bash
curl "http://localhost:8080/api/notes/search?tags=work,ideas" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | `development` |
| `PORT` | Server port | `3000` |
| `POSTGRES_HOST` | PostgreSQL host | `localhost` |
| `POSTGRES_PORT` | PostgreSQL port | `5432` |
| `POSTGRES_DB` | Database name | `quicknotes` |
| `POSTGRES_USER` | Database user | `postgres` |
| `POSTGRES_PASSWORD` | Database password | `password` |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `JWT_SECRET` | JWT signing secret | *Required* |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |
| `LOG_LEVEL` | Logging level | `info` |

## Development

### Start Development Mode
```bash
# With live reload
make dev

# Or with logs
make dev-logs
```

### Run Tests
```bash
make test
```

### View Logs
```bash
make logs
```

## Production Deployment

### Build and Deploy
```bash
make prod
```

### Scale API Instances
```bash
# Scale to 3 instances
docker-compose up -d --scale api-1=2 --scale api-2=1
```

## Monitoring

### Health Checks
- **Load Balancer**: http://localhost:8080/health
- **API Health**: http://localhost:8080/api-health
- **Detailed Health**: http://localhost:8080/health/detailed

### Metrics
Prometheus metrics available at: http://localhost:8080/metrics

Key metrics:
- `http_request_duration_seconds` - Request duration histogram
- `http_requests_total` - Total HTTP requests counter
- `active_users_total` - Active users gauge
- `notes_total` - Total notes gauge

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Notes Table
```sql
CREATE TABLE notes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Caching Strategy

- **Search Results**: Cached for 5 minutes per user/query
- **User Tags**: Cached for 10 minutes per user
- **Note Lists**: Cached for 5 minutes with pagination parameters
- **Cache Invalidation**: Automatic on note creation/update/deletion

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation with Joi
- Security headers with Helmet
- CORS protection
- SQL injection prevention with parameterized queries

## Make Commands

| Command | Description |
|---------|-------------|
| `make help` | Show available commands |
| `make setup` | First-time setup |
| `make build` | Build Docker images |
| `make up` | Start production services |
| `make dev` | Start development services |
| `make down` | Stop all services |
| `make logs` | Show service logs |
| `make clean` | Remove all containers and volumes |
| `make restart` | Restart all services |
| `make health` | Check service health |
| `make test` | Run tests |

## Troubleshooting

### Common Issues

1. **Port already in use**:
   ```bash
   make down
   make clean
   make up
   ```

2. **Database connection failed**:
   - Check PostgreSQL is running
   - Verify environment variables
   - Check Docker network connectivity

3. **Redis connection failed**:
   - Ensure Redis container is healthy
   - Check Redis configuration in docker-compose.yml

4. **API instances not responding**:
   - Check health endpoints
   - Review container logs: `make logs`
   - Restart services: `make restart`

### Logs and Debugging

```bash
# View all logs
make logs

# View specific service logs
docker-compose logs api-1
docker-compose logs postgres
docker-compose logs redis
docker-compose logs nginx

# Follow logs in real-time
docker-compose logs -f api-1
```

## License

MIT License
