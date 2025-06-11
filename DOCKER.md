# Docker Setup for Mermaid UI

This document describes how to run the Mermaid UI application using Docker.

## Quick Start

### Production Build
```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build and run manually
docker build -t pako-mermaid-ui .
docker run -d -p 3000:80 --name mermaid-ui pako-mermaid-ui
```

### Development Build
```bash
# Run development server with hot reload
docker-compose --profile dev up -d

# Or manually
docker build -f Dockerfile.dev -t pako-mermaid-ui:dev .
docker run -d -p 5173:5173 -v $(pwd):/app -v /app/node_modules --name mermaid-ui-dev pako-mermaid-ui:dev
```

## Docker Files

- `Dockerfile` - Multi-stage production build with Nginx
- `Dockerfile.dev` - Development build with hot reload
- `docker-compose.yml` - Orchestration for both prod and dev
- `nginx.conf` - Nginx configuration for production
- `.dockerignore` - Files to exclude from Docker context
- `Makefile` - Convenient commands for Docker operations

## Available Commands

### Using Make (Recommended)
```bash
# Production
make build          # Build production image
make run             # Run production container
make stop            # Stop and remove container
make logs            # View container logs

# Development
make build-dev       # Build development image
make run-dev         # Run development container
make stop-dev        # Stop development container
make logs-dev        # View development logs

# Docker Compose
make compose-up      # Start production services
make compose-up-dev  # Start development services
make compose-down    # Stop all services
make compose-logs    # View all service logs

# Utilities
make shell           # Access production container shell
make shell-dev       # Access development container shell
make health          # Check application health
make cleanup         # Remove containers and images
```

### Using Docker Compose
```bash
# Production
docker-compose up -d                    # Start production service
docker-compose down                     # Stop all services
docker-compose logs -f                  # Follow logs

# Development (with hot reload)
docker-compose --profile dev up -d      # Start development service
docker-compose --profile dev down       # Stop development service
```

### Manual Docker Commands
```bash
# Build production image
docker build -t pako-mermaid-ui .

# Run production container
docker run -d --name mermaid-ui -p 3000:80 pako-mermaid-ui

# Build development image
docker build -f Dockerfile.dev -t pako-mermaid-ui:dev .

# Run development container with volume mounting
docker run -d --name mermaid-ui-dev -p 5173:5173 \
  -v $(pwd):/app -v /app/node_modules \
  pako-mermaid-ui:dev
```

## Configuration

### Environment Variables
- `NODE_ENV` - Set to `development` or `production`
- `PORT` - Port for the application (default: 80 for prod, 5173 for dev)

### Ports
- **Production**: `3000` → `80` (Nginx)
- **Development**: `5173` → `5173` (Vite dev server)

### Volumes (Development)
- Source code is mounted at `/app`
- `node_modules` is maintained in anonymous volume for performance

## Production Features

- **Multi-stage build** for optimized image size
- **Nginx** for efficient static file serving
- **Gzip compression** for faster loading
- **Security headers** for enhanced security
- **Health checks** for container monitoring
- **Asset caching** for better performance

## Development Features

- **Hot reload** for real-time code changes
- **Volume mounting** for live code updates
- **Source maps** for easier debugging
- **All dev dependencies** available

## Health Checks

Both production and development containers include health checks:

```bash
# Check health manually
curl http://localhost:3000/health      # Production
curl http://localhost:5173             # Development

# Docker health status
docker ps                              # Shows health status
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Find process using port
   lsof -i :3000
   # Kill process or use different port
   docker run -p 8080:80 pako-mermaid-ui
   ```

2. **Permission denied (MacOS/Linux)**
   ```bash
   # Make entrypoint executable
   chmod +x docker-entrypoint.sh
   ```

3. **Development changes not reflecting**
   ```bash
   # Ensure volume is mounted correctly
   docker run -v $(pwd):/app -v /app/node_modules ...
   ```

4. **Build failures**
   ```bash
   # Clear Docker cache
   docker system prune -a
   # Rebuild without cache
   docker build --no-cache -t pako-mermaid-ui .
   ```

### Logs and Debugging

```bash
# View container logs
docker logs mermaid-ui

# Follow logs in real-time
docker logs -f mermaid-ui

# Access container shell
docker exec -it mermaid-ui /bin/sh

# Check container status
docker ps -a

# Inspect container
docker inspect mermaid-ui
```

## Performance Optimization

The production build includes several optimizations:

- **Code splitting** for vendor libraries
- **Asset compression** with Gzip
- **Caching headers** for static assets
- **Minification** with esbuild
- **Multi-stage build** for smaller image size

## Security

Security features included:

- **Non-root user** in production container
- **Security headers** via Nginx
- **Content Security Policy** configured
- **No dev dependencies** in production image
- **Minimal attack surface** with Alpine Linux