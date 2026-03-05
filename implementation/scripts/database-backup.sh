#!/bin/bash
# RenderOwl Database Backup Script
# Automated backups for PostgreSQL

set -e

# Configuration
BACKUP_DIR="/backups"
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-30}
S3_BUCKET=${S3_BACKUP_BUCKET:-"renderowl-backups"}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DATE=$(date +%Y-%m-%d)

# Database connection
DB_HOST=${POSTGRES_HOST:-"postgres"}
DB_PORT=${POSTGRES_PORT:-"5432"}
DB_NAME=${POSTGRES_DB:-"renderowl"}
DB_USER=${POSTGRES_USER:-"postgres"}
DB_PASSWORD=${POSTGRES_PASSWORD:-""}

# Backup filename
BACKUP_FILE="renderowl_${DB_NAME}_${TIMESTAMP}.sql.gz"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILE}"

# Logging
LOG_FILE="${BACKUP_DIR}/backup_${DATE}.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

log "========================================="
log "Starting database backup"
log "Database: $DB_NAME"
log "Timestamp: $TIMESTAMP"
log "========================================="

# Perform backup
log "Creating database dump..."
export PGPASSWORD="$DB_PASSWORD"

if pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
    --verbose \
    --no-owner \
    --no-acl \
    --format=plain 2>> "$LOG_FILE" | gzip > "$BACKUP_PATH"; then

    BACKUP_SIZE=$(du -h "$BACKUP_PATH" | cut -f1)
    log "Backup created successfully: $BACKUP_FILE ($BACKUP_SIZE)"
else
    log "ERROR: Backup failed!"
    rm -f "$BACKUP_PATH"
    exit 1
fi

# Verify backup
log "Verifying backup integrity..."
if gunzip -t "$BACKUP_PATH" 2>/dev/null; then
    log "Backup integrity verified"
else
    log "ERROR: Backup integrity check failed!"
    exit 1
fi

# Upload to S3/R2 if configured
if [ -n "$S3_BUCKET" ] && [ -n "$AWS_ACCESS_KEY_ID" ]; then
    log "Uploading to S3..."

    # Configure AWS CLI for R2 if using Cloudflare R2
    if [ -n "$R2_ENDPOINT" ]; then
        aws configure set default.s3.endpoint_url "$R2_ENDPOINT"
    fi

    if aws s3 cp "$BACKUP_PATH" "s3://${S3_BUCKET}/database/${BACKUP_FILE}" 2>> "$LOG_FILE"; then
        log "Backup uploaded to S3 successfully"
    else
        log "WARNING: S3 upload failed, keeping local backup"
    fi
fi

# Clean up old backups locally
log "Cleaning up old backups (retention: $RETENTION_DAYS days)..."
DELETED_COUNT=$(find "$BACKUP_DIR" -name "renderowl_*.sql.gz" -mtime +$RETENTION_DAYS -type f -delete -print | wc -l)
log "Deleted $DELETED_COUNT old local backups"

# Clean up old backups from S3
if [ -n "$S3_BUCKET" ] && [ -n "$AWS_ACCESS_KEY_ID" ]; then
    log "Cleaning up old S3 backups..."
    aws s3 ls "s3://${S3_BUCKET}/database/" | \
        awk '{print $4}' | \
        while read -r file; do
            file_date=$(echo "$file" | grep -oE '[0-9]{8}' | head -1)
            if [ -n "$file_date" ]; then
                file_timestamp=$(date -d "$file_date" +%s 2>/dev/null || date -j -f "%Y%m%d" "$file_date" +%s)
                cutoff_timestamp=$(date -d "$RETENTION_DAYS days ago" +%s)

                if [ "$file_timestamp" -lt "$cutoff_timestamp" ]; then
                    aws s3 rm "s3://${S3_BUCKET}/database/$file" 2>/dev/null && log "Deleted old S3 backup: $file"
                fi
            fi
        done
fi

# Log completion
log "========================================="
log "Backup completed successfully"
log "Backup file: $BACKUP_FILE"
log "Backup size: $BACKUP_SIZE"
log "========================================="

# Send notification if configured
if [ -n "$SLACK_WEBHOOK_URL" ]; then
    curl -s -X POST "$SLACK_WEBHOOK_URL" \
        -H 'Content-type: application/json' \
        --data "{
            \"text\": \"✅ Database backup completed\\nDatabase: $DB_NAME\\nFile: $BACKUP_FILE\\nSize: $BACKUP_SIZE\\nDate: $(date)\"
        }" > /dev/null
fi

exit 0
