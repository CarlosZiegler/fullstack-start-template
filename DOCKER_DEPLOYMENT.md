# Docker Deployment Guide

This guide explains how to deploy the Fullstack Start Template application using Docker with NVIDIA GPU support.

## Prerequisites

1. **Docker Engine** (version 20.10+)
2. **Docker Compose** (version 2.0+)
3. **NVIDIA Docker Runtime** (for GPU support)
4. **NVIDIA Drivers** (version 470+ recommended)

### Installing NVIDIA Docker Runtime

```bash
# Ubuntu/Debian
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -
curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | sudo tee /etc/apt/sources.list.d/nvidia-docker.list

sudo apt-get update && sudo apt-get install -y nvidia-docker2
sudo systemctl restart docker
```

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/CarlosZiegler/fullstack-start-template.git
   cd fullstack-start-template
   ```

2. **Set up environment variables**
   ```bash
   cp .env.docker.example .env
   # Edit .env with your actual values
   ```

3. **Test the Docker build locally**
   ```bash
   ./scripts/docker-build-test.sh
   ```

4. **Run with Docker Compose**
   ```bash
   # Standard deployment (without GPU)
   docker-compose up -d

   # With NVIDIA GPU support
   docker-compose --profile gpu up -d
   ```

## Environment Variables

The application requires several environment variables for proper operation:

### Build-time Variables
These are injected during the Docker build process:
- `VITE_SENTRY_DSN` - Sentry error tracking DSN
- `VITE_SENTRY_ORG` - Sentry organization
- `VITE_SENTRY_PROJECT` - Sentry project name
- `VITE_SERVER_URL` - Server URL (default: http://localhost:3000)
- `SENTRY_AUTH_TOKEN` - Sentry authentication token
- `DATABASE_URL` - PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Authentication secret (min 32 characters)

### Runtime Variables
These are used when the container runs:
- `ANTHROPIC_API_KEY` - Anthropic API key for AI features
- `RESEND_API_KEY` - Resend API key for email services
- `VERCEL_API_KEY` - Vercel API key for deployments

## Docker Image Features

The Docker image includes:
- **Multi-stage build** for optimized image size
- **NVIDIA CUDA runtime** for GPU acceleration
- **Health checks** for container monitoring
- **Non-root user** for security
- **Bun package manager** for fast dependency installation
- **Production-optimized** Node.js runtime

## GitHub Actions Workflow

The repository includes a GitHub Actions workflow that:
1. **Builds the application** using Bun
2. **Creates a Docker image** with the built artifacts
3. **Pushes to GitHub Container Registry** (ghcr.io)

### Setting up GitHub Secrets

Add these secrets to your GitHub repository:
- `VITE_SENTRY_DSN`
- `VITE_SENTRY_ORG`
- `VITE_SENTRY_PROJECT`
- `VITE_SERVER_URL`
- `SENTRY_AUTH_TOKEN`
- `DATABASE_URL`
- `BETTER_AUTH_SECRET`

For deployment:
- `DEPLOY_HOST` - Server hostname/IP
- `DEPLOY_USER` - SSH username
- `DEPLOY_KEY` - SSH private key

## Manual Docker Commands

### Build the image
```bash
docker build \
  --build-arg VITE_SENTRY_DSN="$VITE_SENTRY_DSN" \
  --build-arg VITE_SENTRY_ORG="$VITE_SENTRY_ORG" \
  --build-arg VITE_SENTRY_PROJECT="$VITE_SENTRY_PROJECT" \
  --build-arg VITE_SERVER_URL="$VITE_SERVER_URL" \
  --build-arg SENTRY_AUTH_TOKEN="$SENTRY_AUTH_TOKEN" \
  --build-arg DATABASE_URL="$DATABASE_URL" \
  --build-arg BETTER_AUTH_SECRET="$BETTER_AUTH_SECRET" \
  -t fullstack-start-template:latest .
```

### Run the container with GPU
```bash
docker run -d \
  --name fullstack-app \
  --gpus all \
  -p 3000:3000 \
  -e DATABASE_URL="$DATABASE_URL" \
  -e BETTER_AUTH_SECRET="$BETTER_AUTH_SECRET" \
  -e RESEND_API_KEY="$RESEND_API_KEY" \
  -e ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY" \
  -e VERCEL_API_KEY="$VERCEL_API_KEY" \
  fullstack-start-template:latest
```

## Monitoring and Maintenance

### View logs
```bash
docker-compose logs -f app
```

### Check container health
```bash
docker inspect fullstack-app --format='{{.State.Health.Status}}'
```

### Update and restart
```bash
docker-compose pull
docker-compose up -d
docker system prune -f
```

## Troubleshooting

### GPU not detected
1. Check NVIDIA drivers: `nvidia-smi`
2. Verify Docker runtime: `docker run --rm --gpus all nvidia/cuda:12.3.1-base-ubuntu22.04 nvidia-smi`
3. Check Docker daemon config: `/etc/docker/daemon.json` should include:
   ```json
   {
     "default-runtime": "nvidia",
     "runtimes": {
       "nvidia": {
         "path": "nvidia-container-runtime",
         "runtimeArgs": []
       }
     }
   }
   ```

### Build failures
1. Check environment variables are set
2. Verify network connectivity for package downloads
3. Check available disk space
4. Review build logs: `docker-compose build --no-cache app`

### Container won't start
1. Check port 3000 is not in use: `lsof -i :3000`
2. Verify database connection: `docker-compose logs postgres`
3. Check environment variables in `.env`
4. Review application logs: `docker-compose logs app`

## Security Considerations

1. **Never commit `.env` files** to version control
2. **Use strong secrets** for `BETTER_AUTH_SECRET` (min 32 characters)
3. **Rotate API keys** regularly
4. **Keep base images updated** for security patches
5. **Use read-only file systems** where possible
6. **Limit container capabilities** in production

## Production Deployment

For production deployments:
1. Use a reverse proxy (nginx, traefik) for SSL termination
2. Set up automated backups for PostgreSQL
3. Configure monitoring and alerting
4. Use container orchestration (Kubernetes, Docker Swarm)
5. Implement log aggregation (ELK, Loki)
6. Set up CI/CD pipelines for automated deployments