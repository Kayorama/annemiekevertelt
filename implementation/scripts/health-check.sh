#!/bin/bash
# RenderOwl Health Check Script
# Usage: ./health-check.sh [environment]

set -e

ENVIRONMENT=${1:-staging}
BASE_URL=""

# Set base URL based on environment
if [ "$ENVIRONMENT" == "staging" ]; then
    BASE_URL="https://staging.renderowl.com"
    API_URL="https://api.staging.renderowl.com"
elif [ "$ENVIRONMENT" == "production" ]; then
    BASE_URL="https://renderowl.com"
    API_URL="https://api.renderowl.com"
else
    echo "Unknown environment: $ENVIRONMENT"
    echo "Usage: $0 [staging|production]"
    exit 1
fi

echo "========================================="
echo "RenderOwl Health Check - $ENVIRONMENT"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track overall status
OVERALL_STATUS=0

# Function to check endpoint
check_endpoint() {
    local name=$1
    local url=$2
    local expected_code=${3:-200}

    echo -n "Checking $name... "

    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")

    if [ "$HTTP_STATUS" == "$expected_code" ]; then
        echo -e "${GREEN}OK${NC} (HTTP $HTTP_STATUS)"
        return 0
    else
        echo -e "${RED}FAIL${NC} (HTTP $HTTP_STATUS, expected $expected_code)"
        return 1
    fi
}

# Function to check with response validation
check_endpoint_json() {
    local name=$1
    local url=$2
    local json_path=$3
    local expected_value=$4

    echo -n "Checking $name... "

    RESPONSE=$(curl -s "$url" 2>/dev/null || echo '{}')
    ACTUAL_VALUE=$(echo "$RESPONSE" | jq -r "$json_path" 2>/dev/null || echo "null")

    if [ "$ACTUAL_VALUE" == "$expected_value" ]; then
        echo -e "${GREEN}OK${NC} ($json_path = $expected_value)"
        return 0
    else
        echo -e "${RED}FAIL${NC} ($json_path = $ACTUAL_VALUE, expected $expected_value)"
        return 1
    fi
}

# Check Web Frontend
echo "--- Frontend Checks ---"
if ! check_endpoint "Web App" "$BASE_URL"; then
    OVERALL_STATUS=1
fi

if ! check_endpoint "Web Health" "$BASE_URL/api/health"; then
    OVERALL_STATUS=1
fi

echo ""

# Check API
echo "--- API Checks ---"
if ! check_endpoint "API Root" "$API_URL"; then
    OVERALL_STATUS=1
fi

if ! check_endpoint "API Health" "$API_URL/health"; then
    OVERALL_STATUS=1
fi

if ! check_endpoint "API Ready" "$API_URL/ready"; then
    OVERALL_STATUS=1
fi

echo ""

# Check specific health endpoints with JSON validation
echo "--- Detailed Health Checks ---"

# API health details
API_HEALTH=$(curl -s "$API_URL/health" 2>/dev/null || echo '{}')
echo "API Health Response:"
echo "$API_HEALTH" | jq '.' 2>/dev/null || echo "$API_HEALTH"
echo ""

# Check database connection
DB_STATUS=$(echo "$API_HEALTH" | jq -r '.database // "unknown"' 2>/dev/null || echo "unknown")
if [ "$DB_STATUS" == "connected" ]; then
    echo -e "Database: ${GREEN}Connected${NC}"
else
    echo -e "Database: ${RED}$DB_STATUS${NC}"
    OVERALL_STATUS=1
fi

# Check Redis connection
REDIS_STATUS=$(echo "$API_HEALTH" | jq -r '.redis // "unknown"' 2>/dev/null || echo "unknown")
if [ "$REDIS_STATUS" == "connected" ]; then
    echo -e "Redis: ${GREEN}Connected${NC}"
else
    echo -e "Redis: ${RED}$REDIS_STATUS${NC}"
    OVERALL_STATUS=1
fi

# Check Replicate API
REPLICATE_STATUS=$(echo "$API_HEALTH" | jq -r '.replicate // "unknown"' 2>/dev/null || echo "unknown")
if [ "$REPLICATE_STATUS" == "available" ]; then
    echo -e "Replicate API: ${GREEN}Available${NC}"
else
    echo -e "Replicate API: ${YELLOW}$REPLICATE_STATUS${NC}"
fi

echo ""

# Check worker health
echo "--- Worker Checks ---"
WORKER_HEALTH=$(curl -s "$API_URL/workers/health" 2>/dev/null || echo '{}')
echo "Worker Health Response:"
echo "$WORKER_HEALTH" | jq '.' 2>/dev/null || echo "Unable to fetch worker health"

# Check queue depths
RENDER_QUEUE=$(echo "$WORKER_HEALTH" | jq -r '.queues.render.pending // 0' 2>/dev/null || echo "0")
EXPORT_QUEUE=$(echo "$WORKER_HEALTH" | jq -r '.queues.export.pending // 0' 2>/dev/null || echo "0")

echo ""
echo "Queue Status:"
echo "  Render queue: $RENDER_QUEUE pending"
echo "  Export queue: $EXPORT_QUEUE pending"

if [ "$RENDER_QUEUE" -gt 100 ] || [ "$EXPORT_QUEUE" -gt 100 ]; then
    echo -e "  ${YELLOW}WARNING: High queue depth${NC}"
fi

echo ""

# SSL Certificate Check
echo "--- SSL Certificate Check ---"
SSL_EXPIRY=$(echo | openssl s_client -servername "$BASE_URL" -connect "$BASE_URL:443" 2>/dev/null | openssl x509 -noout -dates | grep notAfter | cut -d= -f2)
if [ -n "$SSL_EXPIRY" ]; then
    echo -e "SSL Certificate expires: ${GREEN}$SSL_EXPIRY${NC}"
else
    echo -e "SSL Certificate: ${YELLOW}Unable to check${NC}"
fi

echo ""
echo "========================================="
if [ $OVERALL_STATUS -eq 0 ]; then
    echo -e "${GREEN}All health checks passed!${NC}"
else
    echo -e "${RED}Some health checks failed!${NC}"
fi
echo "========================================="

exit $OVERALL_STATUS
