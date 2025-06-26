# Docker Deployment Guide with NGINX

This guide explains how to deploy the Fullstack Start Template application using Docker with NGINX as a reverse proxy.

## Prerequisites

1. **Docker Engine** (version 20.10+)
2. **Docker Compose** (version 2.0+)
3. **Domain name** (for production deployment with SSL)
4. **Server with open ports** 80 and 443

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
   nano .env
   ```

3. **Test the Docker build locally**
   ```bash
   ./scripts/docker-build-test.sh
   ```

4. **Run with Docker Compose**
   ```bash
   # Development/testing (HTTP only)
   docker-compose up -d

   # Production (with SSL/HTTPS)
   docker-compose -f docker-compose.prod.yml up -d
   ```

## Architecture

The deployment consists of:
- **NGINX** - Reverse proxy handling incoming requests
- **App** - Your Node.js application (can scale to multiple instances)
- **PostgreSQL** - Primary database
- **Redis** - Caching and session storage
- **Certbot** - Automatic SSL certificate management (production only)

## Environment Variables

### Required Variables

```bash
# Sentry Configuration
VITE_SENTRY_DSN=your_sentry_dsn
VITE_SENTRY_ORG=your_org
VITE_SENTRY_PROJECT=your_project
SENTRY_AUTH_TOKEN=your_token

# Server Configuration
VITE_SERVER_URL=https://yourdomain.com

# Database Configuration
DATABASE_URL=postgresql://postgres:password@postgres:5432/dbname
POSTGRES_USER=postgres
POSTGRES_PASSWORD=secure_password
POSTGRES_DB=fullstack

# Authentication
BETTER_AUTH_SECRET=min_32_character_secret

# API Keys
ANTHROPIC_API_KEY=your_key
RESEND_API_KEY=your_key
VERCEL_API_KEY=your_key

# Redis
REDIS_PASSWORD=secure_redis_password
```

## NGINX Configuration

### Development Setup
The basic NGINX configuration (`nginx/nginx.conf`) includes:
- Reverse proxy to Node.js app
- WebSocket support
- Rate limiting
- Security headers
- Gzip compression
- Static file caching

### Production Setup with SSL

1. **Update domain in configuration**
   ```bash
   cp nginx/conf.d/ssl.conf.example nginx/conf.d/ssl.conf
   # Edit ssl.conf and replace 'yourdomain.com' with your actual domain
   ```

2. **Generate SSL certificates**
   ```bash
   # First time setup - generate certificates
   docker-compose -f docker-compose.prod.yml run --rm certbot certonly \
     --webroot --webroot-path /var/www/certbot \
     --email admin@yourdomain.com \
     --agree-tos \
     --no-eff-email \
     -d yourdomain.com \
     -d www.yourdomain.com
   ```

3. **Start services**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

## GitHub Actions Workflow

The repository includes a GitHub Actions workflow that:

### Step 1: Build Application
- Installs dependencies with Bun
- Runs tests
- Builds the application
- Uploads build artifacts

### Step 2: Build Docker Image
- Creates optimized Docker image
- Pushes to GitHub Container Registry
- Supports multi-platform builds (amd64, arm64)

### Required GitHub Secrets
```
VITE_SENTRY_DSN
VITE_SENTRY_ORG
VITE_SENTRY_PROJECT
VITE_SERVER_URL
SENTRY_AUTH_TOKEN
DATABASE_URL
BETTER_AUTH_SECRET

# For deployment
DEPLOY_HOST
DEPLOY_USER
DEPLOY_KEY
```

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

### Run individual containers
```bash
# Run app only
docker run -d \
  --name fullstack-app \
  -p 3000:3000 \
  -e DATABASE_URL="$DATABASE_URL" \
  -e BETTER_AUTH_SECRET="$BETTER_AUTH_SECRET" \
  -e RESEND_API_KEY="$RESEND_API_KEY" \
  -e ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY" \
  fullstack-start-template:latest
```

## Monitoring and Maintenance

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f nginx
docker-compose logs -f app
```

### Check health status
```bash
# Check all services
docker-compose ps

# Check specific health endpoints
curl http://localhost/nginx-health
curl http://localhost:3000/health
```

### Update and restart
```bash
# Pull latest images
docker-compose pull

# Restart with new images
docker-compose up -d

# Clean up old images
docker system prune -f
```

### Database backups
The production setup includes automatic daily backups:
```bash
# Manual backup
docker-compose exec postgres pg_dump -U postgres fullstack > backup.sql

# Restore backup
docker-compose exec -T postgres psql -U postgres fullstack < backup.sql
```

## Scaling

### Horizontal scaling
```bash
# Scale app to 3 instances
docker-compose up -d --scale app=3
```

### Load balancing
NGINX automatically load balances between app instances using the `least_conn` strategy.

## Troubleshooting

### NGINX issues
1. **502 Bad Gateway**
   - Check if app container is running: `docker-compose ps app`
   - Check app logs: `docker-compose logs app`
   - Verify app health: `docker-compose exec app wget -qO- http://localhost:3000/health`

2. **Connection refused**
   - Check NGINX is running: `docker-compose ps nginx`
   - Verify port binding: `docker-compose port nginx 80`
   - Check firewall rules

### SSL certificate issues
1. **Certificate renewal failed**
   ```bash
   # Manually renew
   docker-compose -f docker-compose.prod.yml run --rm certbot renew
   ```

2. **Wrong domain**
   - Update domain in `nginx/conf.d/ssl.conf`
   - Regenerate certificates

### Database connection issues
1. **Connection refused**
   - Check postgres is running: `docker-compose ps postgres`
   - Verify DATABASE_URL format
   - Check network connectivity: `docker-compose exec app ping postgres`

### Performance issues
1. **Slow response times**
   - Scale app instances: `docker-compose up -d --scale app=3`
   - Check resource usage: `docker stats`
   - Review NGINX cache settings
   - Enable Redis caching

## Security Best Practices

1. **Environment variables**
   - Never commit `.env` files
   - Use strong passwords (min 20 chars)
   - Rotate secrets regularly

2. **Network security**
   - Use internal Docker networks
   - Expose only necessary ports
   - Enable firewall (ufw, iptables)

3. **SSL/TLS**
   - Use strong cipher suites
   - Enable HSTS
   - Regular certificate updates

4. **Container security**
   - Run as non-root user
   - Use read-only filesystems where possible
   - Regular security updates

5. **Monitoring**
   - Set up log aggregation
   - Monitor resource usage
   - Configure alerts

## Production Checklist

- [ ] Domain configured with DNS pointing to server
- [ ] Environment variables set in `.env`
- [ ] SSL certificates generated
- [ ] Firewall configured (ports 80, 443 open)
- [ ] Automated backups configured
- [ ] Monitoring and alerts set up
- [ ] Log rotation configured
- [ ] Resource limits set in docker-compose
- [ ] Health checks verified
- [ ] Security headers tested