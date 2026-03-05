#!/bin/bash
# RenderOwl Deployment Script
# Deploys to Coolify staging or production

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
ENVIRONMENT=${1:-staging}
FORCE_REBUILD=${2:-false}
COOLIFY_SCRIPT="${COOLIFY_SCRIPT:-../../skills/coolify/scripts/coolify.sh}"

# Validate environment
if [ "$ENVIRONMENT" != "staging" ] && [ "$ENVIRONMENT" != "production" ]; then
    echo -e "${RED}Error: Invalid environment '$ENVIRONMENT'${NC}"
    echo "Usage: $0 [staging|production] [--force]"
    exit 1
fi

# Get application UUIDs from config
get_app_uuid() {
    local app_name=$1
    # This would typically read from a config file or Coolify API
    # For now, we'll use environment variables
    env_var="COOLIFY_UUID_${app_name}_${ENVIRONMENT}"
    echo "${!env_var}"
}

API_UUID=$(get_app_uuid "api")
WEB_UUID=$(get_app_uuid "web")
WORKER_RENDER_UUID=$(get_app_uuid "worker_render")
WORKER_EXPORT_UUID=$(get_app_uuid "worker_export")

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}RenderOwl Deployment${NC}"
echo -e "${BLUE}Environment: $ENVIRONMENT${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# Pre-deployment checks
echo -e "${BLUE}Running pre-deployment checks...${NC}"

# Check if we're on the correct branch
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
EXPECTED_BRANCH=$([ "$ENVIRONMENT" == "production" ] && echo "main" || echo "develop")

if [ "$CURRENT_BRANCH" != "$EXPECTED_BRANCH" ]; then
    echo -e "${YELLOW}Warning: Current branch ($CURRENT_BRANCH) != expected ($EXPECTED_BRANCH)${NC}"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Run tests
echo -e "${BLUE}Running test suite...${NC}"
if [ -f "../../package.json" ]; then
    cd ../..
    if ! npm run test:ci; then
        echo -e "${RED}Tests failed! Aborting deployment.${NC}"
        exit 1
    fi
    cd - > /dev/null
fi

echo -e "${GREEN}✓ Pre-deployment checks passed${NC}"
echo ""

# Deploy to Coolify
deploy_app() {
    local name=$1
    local uuid=$2

    if [ -z "$uuid" ]; then
        echo -e "${YELLOW}Skipping $name - no UUID configured${NC}"
        return 0
    fi

    echo -e "${BLUE}Deploying $name...${NC}"

    DEPLOY_FLAGS=""
    if [ "$FORCE_REBUILD" == "--force" ] || [ "$FORCE_REBUILD" == "true" ]; then
        DEPLOY_FLAGS="--force"
    fi

    if $COOLIFY_SCRIPT deploy --uuid "$uuid" $DEPLOY_FLAGS; then
        echo -e "${GREEN}✓ $name deployed successfully${NC}"
    else
        echo -e "${RED}✗ $name deployment failed${NC}"
        return 1
    fi
}

echo -e "${BLUE}Starting deployment...${NC}"

# Deploy order: API first, then workers, then web
FAILED=0

deploy_app "API" "$API_UUID" || FAILED=1

if [ $FAILED -eq 0 ]; then
    # Wait for API to be ready
    echo -e "${BLUE}Waiting for API health check...${NC}"
    sleep 10

    # Deploy workers
    deploy_app "Worker (Render)" "$WORKER_RENDER_UUID" || FAILED=1
    deploy_app "Worker (Export)" "$WORKER_EXPORT_UUID" || FAILED=1

    # Deploy web frontend
    deploy_app "Web Frontend" "$WEB_UUID" || FAILED=1
fi

if [ $FAILED -ne 0 ]; then
    echo ""
    echo -e "${RED}=========================================${NC}"
    echo -e "${RED}Deployment completed with failures!${NC}"
    echo -e "${RED}=========================================${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""

# Post-deployment verification
echo -e "${BLUE}Running post-deployment verification...${NC}"
sleep 5

./health-check.sh "$ENVIRONMENT"
HEALTH_STATUS=$?

if [ $HEALTH_STATUS -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ All systems operational${NC}"

    # Send success notification
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        curl -s -X POST "$SLACK_WEBHOOK_URL" \
            -H 'Content-type: application/json' \
            --data "{
                \"text\": \"✅ RenderOwl deployed to $ENVIRONMENT\\nVersion: $(git rev-parse --short HEAD)\\nBranch: $CURRENT_BRANCH\\nTime: $(date)\"
            }" > /dev/null
    fi
else
    echo ""
    echo -e "${RED}✗ Health checks failed!${NC}"
    echo -e "${YELLOW}Consider rolling back if issues persist.${NC}"
    exit 1
fi

exit 0
