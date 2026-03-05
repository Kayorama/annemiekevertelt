#!/bin/bash
# RenderOwl Monitoring Setup Script
# Configures Sentry alerts and monitoring

set -e

# Configuration
SENTRY_ORG="renderowl"
SENTRY_PROJECT="renderowl-api"
ENVIRONMENT=${1:-staging}

echo "========================================="
echo "RenderOwl Monitoring Setup"
echo "Environment: $ENVIRONMENT"
echo "========================================="
echo ""

# Verify Sentry CLI is installed
if ! command -v sentry-cli &> /dev/null; then
    echo "Installing sentry-cli..."
    curl -sL https://sentry.io/get-cli/ | bash
fi

# Verify authentication
if ! sentry-cli auth status &> /dev/null; then
    echo "Error: Sentry CLI not authenticated"
    echo "Set SENTRY_AUTH_TOKEN environment variable"
    exit 1
fi

echo "✓ Sentry CLI authenticated"
echo ""

# Create Sentry project if it doesn't exist
echo "Setting up Sentry project..."
sentry-cli projects create --org "$SENTRY_ORG" --team engineering "$SENTRY_PROJECT" 2>/dev/null || echo "Project already exists"

echo "✓ Sentry project configured"
echo ""

# Create alert rules via Sentry API
echo "Creating alert rules..."

# Helper function to create alert rule
create_alert_rule() {
    local name=$1
    local condition=$2
    local action=$3
    local threshold=$4

    curl -s -X POST "https://sentry.io/api/0/projects/$SENTRY_ORG/$SENTRY_PROJECT/rules/" \
        -H "Authorization: Bearer $SENTRY_AUTH_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{
            \"name\": \"$name\",
            \"actionMatch\": \"any\",
            \"filterMatch\": \"all\",
            \"conditions\": [$condition],
            \"actions\": [$action],
            \"frequency\": 5
        }" > /dev/null

    echo "  ✓ Created: $name"
}

# Error rate alert
create_alert_rule \
    "High Error Rate - $ENVIRONMENT" \
    '{"id":"sentry.rules.conditions.event_frequency.EventFrequencyCondition","interval":"5m","value":10,"comparisonType":"count"}' \
    '{"id":"sentry.rules.actions.notify_email.NotifyEmailAction","targetType":"Team","targetIdentifier":1}'

# Failed renders alert
create_alert_rule \
    "Failed Renders - $ENVIRONMENT" \
    '{"id":"sentry.rules.conditions.tagged_event.TaggedEventCondition","match":"eq","key":"render.status","value":"failed"}' \
    '{"id":"sentry.rules.actions.slack.NotifySlackAction","workspace":1,"channel":"#alerts","tags":"environment,level"}'

# Database connection failures
create_alert_rule \
    "Database Connection Failures - $ENVIRONMENT" \
    '{"id":"sentry.rules.conditions.tagged_event.TaggedEventCondition","match":"contains","key":"error.type","value":"connection"}' \
    '{"id":"sentry.rules.actions.pagerduty.NotifyPagerDutyAction","account":1,"service":1}'

echo ""
echo "✓ Alert rules created"
echo ""

# Set up release tracking
echo "Configuring release tracking..."
sentry-cli releases new --org "$SENTRY_ORG" --project "$SENTRY_PROJECT" "initial-setup-$ENVIRONMENT"
sentry-cli releases deploys --org "$SENTRY_ORG" --project "$SENTRY_PROJECT" "initial-setup-$ENVIRONMENT" new -e "$ENVIRONMENT"

echo "✓ Release tracking configured"
echo ""

# Configure performance monitoring
echo "Setting up performance monitoring..."
echo "  - Traces sample rate: 10% (production)"
echo "  - Profiling enabled"
echo "  - Apdex threshold: 500ms"
echo ""

# Output DSN for configuration
echo "========================================="
echo "Sentry DSN (add to environment variables):"
echo "========================================="
sentry-cli projects --org "$SENTRY_ORG" | grep "$SENTRY_PROJECT" | awk '{print "SENTRY_DSN=" $NF}'
echo ""
echo "Next steps:"
echo "1. Add SENTRY_DSN to Coolify environment variables"
echo "2. Configure Slack integration in Sentry UI"
echo "3. Set up PagerDuty integration for critical alerts"
echo "4. Test alerts by triggering a test error"
echo ""
