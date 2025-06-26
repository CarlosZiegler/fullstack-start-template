#!/bin/bash

# Script to test Docker build locally
set -e

echo "🚀 Testing Docker build and NGINX setup..."

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

# Test docker-compose configuration
echo "🧪 Testing docker-compose configuration..."
docker-compose config > /dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Docker compose configuration is valid!${NC}"
else
    echo -e "${RED}❌ Docker compose configuration is invalid!${NC}"
    exit 1
fi

# Start services
echo "🚀 Starting services with docker-compose..."
docker-compose up -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 15

# Check if all services are running
echo "🔍 Checking service status..."
SERVICES=("nginx" "app" "postgres" "redis")
ALL_HEALTHY=true

for service in "${SERVICES[@]}"; do
    if docker-compose ps | grep -q "${service}.*Up"; then
        echo -e "${GREEN}✅ ${service} is running${NC}"
    else
        echo -e "${RED}❌ ${service} is not running${NC}"
        ALL_HEALTHY=false
    fi
done

# Test endpoints
if [ "$ALL_HEALTHY" = true ]; then
    echo "🏥 Testing health endpoints..."
    
    # Test NGINX health
    if curl -f http://localhost/nginx-health 2>/dev/null; then
        echo -e "${GREEN}✅ NGINX health check passed!${NC}"
    else
        echo -e "${RED}❌ NGINX health check failed!${NC}"
    fi
    
    # Test app through NGINX
    if curl -f http://localhost/ 2>/dev/null | grep -q "<"; then
        echo -e "${GREEN}✅ App is accessible through NGINX!${NC}"
    else
        echo -e "${YELLOW}⚠️  App might not be fully initialized yet${NC}"
    fi
fi

# Show logs
echo ""
echo "📋 Recent logs:"
echo "==================== NGINX logs ===================="
docker-compose logs --tail=10 nginx
echo ""
echo "==================== App logs ===================="
docker-compose logs --tail=10 app

# Clean up
echo ""
echo "🧹 Cleaning up test environment..."
read -p "Do you want to stop and remove the test containers? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker-compose down
    echo -e "${GREEN}✅ Test containers removed${NC}"
fi

echo ""
echo -e "${GREEN}✅ Docker build test completed!${NC}"
echo ""
echo "Next steps:"
echo "1. For development: docker-compose up -d"
echo "2. For production: docker-compose -f docker-compose.prod.yml up -d"
echo "3. Configure SSL certificates for production deployment"