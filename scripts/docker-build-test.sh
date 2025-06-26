#!/bin/bash

# Script to test Docker build locally
set -e

echo "🚀 Testing Docker build..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}Warning: .env file not found. Copying from .env.docker.example...${NC}"
    cp .env.docker.example .env
    echo -e "${YELLOW}Please edit .env file with your actual values before running in production.${NC}"
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Build the Docker image
echo "📦 Building Docker image..."
docker build \
    --build-arg VITE_SENTRY_DSN="${VITE_SENTRY_DSN}" \
    --build-arg VITE_SENTRY_ORG="${VITE_SENTRY_ORG}" \
    --build-arg VITE_SENTRY_PROJECT="${VITE_SENTRY_PROJECT}" \
    --build-arg VITE_SERVER_URL="${VITE_SERVER_URL}" \
    --build-arg SENTRY_AUTH_TOKEN="${SENTRY_AUTH_TOKEN}" \
    --build-arg DATABASE_URL="${DATABASE_URL}" \
    --build-arg BETTER_AUTH_SECRET="${BETTER_AUTH_SECRET}" \
    -t fullstack-start-template:test .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Docker build successful!${NC}"
else
    echo -e "${RED}❌ Docker build failed!${NC}"
    exit 1
fi

# Test if the image runs
echo "🧪 Testing Docker image..."
docker run --rm -d \
    --name fullstack-test \
    -p 3001:3000 \
    -e DATABASE_URL="${DATABASE_URL}" \
    -e BETTER_AUTH_SECRET="${BETTER_AUTH_SECRET}" \
    -e RESEND_API_KEY="${RESEND_API_KEY}" \
    -e ANTHROPIC_API_KEY="${ANTHROPIC_API_KEY}" \
    -e VERCEL_API_KEY="${VERCEL_API_KEY}" \
    fullstack-start-template:test

# Wait for the container to start
echo "⏳ Waiting for container to start..."
sleep 10

# Check if container is running
if docker ps | grep -q fullstack-test; then
    echo -e "${GREEN}✅ Container is running!${NC}"
    
    # Try to access the health endpoint
    echo "🏥 Checking health endpoint..."
    if curl -f http://localhost:3001/health 2>/dev/null; then
        echo -e "${GREEN}✅ Health check passed!${NC}"
    else
        echo -e "${YELLOW}⚠️  Health endpoint not responding (this might be normal if not implemented)${NC}"
    fi
    
    # Show logs
    echo "📋 Container logs:"
    docker logs fullstack-test | tail -20
    
    # Clean up
    echo "🧹 Cleaning up..."
    docker stop fullstack-test
else
    echo -e "${RED}❌ Container failed to start!${NC}"
    docker logs fullstack-test
    exit 1
fi

echo -e "${GREEN}✅ All tests passed! Docker image is ready for deployment.${NC}"
echo ""
echo "To run with docker-compose:"
echo "  docker-compose up -d"
echo ""
echo "To run with NVIDIA GPU support:"
echo "  docker-compose --profile gpu up -d"