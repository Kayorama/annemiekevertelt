#!/bin/bash
# Coolify Deployment Script for Annemieke Vertelt
# This script helps deploy the application to Coolify

set -e

echo "🚀 Annemieke Vertelt - Coolify Deployment Script"
echo "================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
REPO_URL="https://github.com/Kayorama/annemiekevertelt"
PROJECT_NAME="annemiekevertelt"

echo -e "${GREEN}Repository:${NC} $REPO_URL"
echo ""

# Check if Coolify token is set
if [ -z "$COOLIFY_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  COOLIFY_TOKEN not set${NC}"
    echo "Please set your Coolify API token:"
    echo "  export COOLIFY_TOKEN='your-token-here'"
    echo ""
    echo "Get your token from: https://app.coolify.io/api-keys"
    exit 1
fi

echo -e "${GREEN}✓${NC} Coolify token is configured"
echo ""

# Generate secrets if needed
echo "🔐 Generating secure secrets..."
PAYLOAD_SECRET=$(openssl rand -base64 32)
POSTGRES_PASSWORD=$(openssl rand -base64 24)
echo -e "${GREEN}✓${NC} Secrets generated"
echo ""

# Environment variables template
echo "📋 Environment Variables to configure in Coolify:"
echo "=================================================="
echo ""
echo "# Database"
echo "POSTGRES_USER=annemieke"
echo "POSTGRES_PASSWORD=$POSTGRES_PASSWORD"
echo "POSTGRES_DB=annemieke_db"
echo ""
echo "# PayloadCMS"
echo "PAYLOAD_SECRET=$PAYLOAD_SECRET"
echo "RESEND_API_KEY=your-resend-api-key-here"
echo ""
echo "# Build Arguments"
echo "PAYLOAD_URL=https://cms.annemiekevertelt.nl"
echo ""

# Save to file
ENV_FILE=".env.production"
cat > $ENV_FILE << EOF
# Annemieke Vertelt - Production Environment Variables
# Generated on $(date)

# Database
POSTGRES_USER=annemieke
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
POSTGRES_DB=annemieke_db

# PayloadCMS
PAYLOAD_SECRET=$PAYLOAD_SECRET
RESEND_API_KEY=your-resend-api-key-here

# Build Arguments
PAYLOAD_URL=https://cms.annemiekevertelt.nl
EOF

echo -e "${GREEN}✓${NC} Environment variables saved to: $ENV_FILE"
echo ""

# Instructions
echo "📖 Next Steps:"
echo "=============="
echo ""
echo "1. Go to your Coolify dashboard:"
echo "   https://app.coolify.io"
echo ""
echo "2. Create a new Project (or use existing):"
echo "   - Click 'New Project'"
echo "   - Name: $PROJECT_NAME"
echo ""
echo "3. Add a Service → Docker Compose:"
echo "   - Repository: $REPO_URL"
echo "   - Branch: main"
echo "   - Docker Compose: ./docker-compose.production.yml"
echo ""
echo "4. Configure Environment Variables:"
echo "   Copy the variables above into Coolify's environment settings"
echo ""
echo "5. Configure Domains:"
echo "   - annemiekevertelt.nl (frontend)"
echo "   - cms.annemiekevertelt.nl (admin - optional)"
echo ""
echo "6. Deploy:"
echo "   - Click 'Deploy' in Coolify"
echo "   - Wait for build and deployment to complete"
echo ""
echo "7. Initial Setup:"
echo "   - Visit https://annemiekevertelt.nl/admin"
echo "   - Create your admin user"
echo "   - Start adding content!"
echo ""
echo "================================================="
echo -e "${GREEN}Deployment configuration complete!${NC}"
echo ""
echo "⚠️  IMPORTANT: Save the .env.production file securely!"
echo "   It contains sensitive passwords that cannot be recovered."
echo ""
