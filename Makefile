# Makefile for Docker operations

# Variables
IMAGE_NAME=pako-mermaid-ui
TAG=latest
CONTAINER_NAME=mermaid-ui
PORT=3000

# Build the Docker image
build:
	docker build -t $(IMAGE_NAME):$(TAG) .

# Build development image
build-dev:
	docker build -f Dockerfile.dev -t $(IMAGE_NAME):dev .

# Run the container in production mode
run:
	docker run -d --name $(CONTAINER_NAME) -p $(PORT):80 $(IMAGE_NAME):$(TAG)

# Run in development mode
run-dev:
	docker run -d --name $(CONTAINER_NAME)-dev -p 5173:5173 -v $$(pwd):/app -v /app/node_modules $(IMAGE_NAME):dev

# Stop and remove container
stop:
	docker stop $(CONTAINER_NAME) || true
	docker rm $(CONTAINER_NAME) || true

# Stop development container
stop-dev:
	docker stop $(CONTAINER_NAME)-dev || true
	docker rm $(CONTAINER_NAME)-dev || true

# View logs
logs:
	docker logs -f $(CONTAINER_NAME)

# View development logs
logs-dev:
	docker logs -f $(CONTAINER_NAME)-dev

# Execute shell in running container
shell:
	docker exec -it $(CONTAINER_NAME) /bin/sh

# Execute shell in development container
shell-dev:
	docker exec -it $(CONTAINER_NAME)-dev /bin/sh

# Clean up images
clean:
	docker rmi $(IMAGE_NAME):$(TAG) || true
	docker rmi $(IMAGE_NAME):dev || true

# Docker Compose commands
compose-up:
	docker-compose up -d

compose-up-dev:
	docker-compose --profile dev up -d

compose-down:
	docker-compose down

compose-logs:
	docker-compose logs -f

compose-build:
	docker-compose build

# Full cleanup
cleanup: stop stop-dev clean
	docker system prune -f

# Health check
health:
	curl -f http://localhost:$(PORT)/health || echo "Health check failed"

.PHONY: build build-dev run run-dev stop stop-dev logs logs-dev shell shell-dev clean compose-up compose-up-dev compose-down compose-logs compose-build cleanup health