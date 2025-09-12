#!/bin/bash
# Songify Deployment Script (Podman)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-development}
COMPOSE_FILE="docker-compose.yml"

if [ "$ENVIRONMENT" = "production" ]; then
    COMPOSE_FILE="docker-compose.prod.yml"
fi

echo -e "${BLUE}🦭 Deploying Songify with Podman in ${ENVIRONMENT} mode...${NC}"

# Check prerequisites
echo -e "${YELLOW}📋 Checking prerequisites...${NC}"

if ! command -v podman &> /dev/null; then
    echo -e "${RED}❌ Podman is not installed${NC}"
    echo -e "${YELLOW}💡 Install Podman: https://podman.io/getting-started/installation${NC}"
    exit 1
fi

if ! command -v podman-compose &> /dev/null; then
    echo -e "${RED}❌ Podman Compose is not installed${NC}"
    echo -e "${YELLOW}💡 Install with: pip3 install podman-compose${NC}"
    exit 1
fi

# Check environment files
if [ "$ENVIRONMENT" = "production" ]; then
    if [ ! -f "backend/.env.production" ]; then
        echo -e "${RED}❌ Missing backend/.env.production${NC}"
        exit 1
    fi
    if [ ! -f "frontend/.env.production" ]; then
        echo -e "${RED}❌ Missing frontend/.env.production${NC}"
        exit 1
    fi
else
    if [ ! -f "backend/.env" ]; then
        echo -e "${YELLOW}⚠️  Creating backend/.env from Docker template${NC}"
        cp backend/env.docker.template backend/.env
        echo -e "${YELLOW}⚠️  Please edit backend/.env with your Spotify credentials${NC}"
    fi
    if [ ! -f "frontend/.env" ]; then
        echo -e "${YELLOW}⚠️  Creating frontend/.env from Docker template${NC}"
        cp frontend/env.docker.template frontend/.env
        echo -e "${YELLOW}⚠️  Please edit frontend/.env with your configuration${NC}"
    fi
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

# Stop existing containers
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
podman-compose -f $COMPOSE_FILE down || true

# Pull latest images (for production)
if [ "$ENVIRONMENT" = "production" ]; then
    echo -e "${YELLOW}📥 Pulling latest base images...${NC}"
    podman-compose -f $COMPOSE_FILE pull --ignore-pull-failures || true
fi

# Build and start services
echo -e "${YELLOW}🔨 Building and starting services with Podman...${NC}"
podman-compose -f $COMPOSE_FILE up -d --build

# Wait for services to be healthy
echo -e "${YELLOW}⏳ Waiting for services to be healthy...${NC}"
sleep 10

# Check service health
echo -e "${YELLOW}🏥 Checking service health...${NC}"

# Wait for backend health
for i in {1..30}; do
    if curl -s http://localhost:3000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend is healthy${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ Backend health check failed${NC}"
        docker-compose -f $COMPOSE_FILE logs backend
        exit 1
    fi
    sleep 2
done

# Wait for frontend health
for i in {1..30}; do
    if curl -s http://localhost/health > /dev/null 2>&1 || curl -s http://localhost/ > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend is healthy${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ Frontend health check failed${NC}"
        docker-compose -f $COMPOSE_FILE logs frontend
        exit 1
    fi
    sleep 2
done

# Show service status
echo -e "${BLUE}📊 Service Status:${NC}"
podman-compose -f $COMPOSE_FILE ps

# Show access URLs
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${BLUE}📍 Access URLs:${NC}"

if [ "$ENVIRONMENT" = "production" ]; then
    echo -e "  Frontend: ${GREEN}https://${DOMAIN:-yourdomain.com}${NC}"
    echo -e "  Backend API: ${GREEN}https://api.${DOMAIN:-yourdomain.com}${NC}"
    echo -e "  Traefik Dashboard: ${GREEN}https://traefik.${DOMAIN:-yourdomain.com}${NC}"
else
    echo -e "  Frontend: ${GREEN}http://localhost${NC}"
    echo -e "  Backend API: ${GREEN}http://localhost:3000${NC}"
    echo -e "  Backend Health: ${GREEN}http://localhost:3000/health${NC}"
fi

echo -e "${BLUE}📝 Useful Podman commands:${NC}"
echo -e "  View logs: ${YELLOW}podman-compose -f $COMPOSE_FILE logs -f${NC}"
echo -e "  Stop services: ${YELLOW}podman-compose -f $COMPOSE_FILE down${NC}"
echo -e "  Restart services: ${YELLOW}podman-compose -f $COMPOSE_FILE restart${NC}"
echo -e "  List containers: ${YELLOW}podman ps${NC}"

echo -e "${GREEN}🦭 Songify with Podman is ready to rock! 🎵${NC}"
