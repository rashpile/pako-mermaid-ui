# Build stage
FROM node:18-alpine AS builder

# Build arguments
ARG BUILDTIME
ARG VERSION
ARG REVISION

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production=false

# Copy source code
COPY . .

# Build the application (skip TypeScript checks for Docker build)
RUN npm run build:docker

# Production stage
FROM nginx:alpine AS production

# Build arguments
ARG BUILDTIME
ARG VERSION
ARG REVISION

# Install curl for health checks
RUN apk add --no-cache curl

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Add labels for metadata
LABEL org.opencontainers.image.title="Pako Mermaid UI"
LABEL org.opencontainers.image.description="Web-based Mermaid diagram editor with AI assistant"
LABEL org.opencontainers.image.version="${VERSION}"
LABEL org.opencontainers.image.created="${BUILDTIME}"
LABEL org.opencontainers.image.revision="${REVISION}"
LABEL org.opencontainers.image.source="https://github.com/pkoptilin/pako-mermaid-ui"

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:80/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]