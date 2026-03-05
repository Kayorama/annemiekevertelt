-- Migration: Add performance indexes for RenderOwl
-- Created: 2026-03-05
-- Description: Optimizes query performance for high-traffic tables

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- Projects table indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_updated ON projects(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status) WHERE status != 'archived';

-- Renders table indexes
CREATE INDEX IF NOT EXISTS idx_renders_project_id ON renders(project_id);
CREATE INDEX IF NOT EXISTS idx_renders_user_id ON renders(user_id);
CREATE INDEX IF NOT EXISTS idx_renders_status ON renders(status);
CREATE INDEX IF NOT EXISTS idx_renders_user_status ON renders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_renders_replicate_id ON renders(replicate_id);
CREATE INDEX IF NOT EXISTS idx_renders_created_at ON renders(created_at DESC);

-- Credit transactions indexes
CREATE INDEX IF NOT EXISTS idx_credit_txs_user_id ON credit_txs(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_txs_user_created ON credit_txs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_txs_type ON credit_txs(type);
CREATE INDEX IF NOT EXISTS idx_credit_txs_payment_id ON credit_txs(payment_id);
CREATE INDEX IF NOT EXISTS idx_credit_txs_render_id ON credit_txs(render_id);

-- Payment intents indexes
CREATE INDEX IF NOT EXISTS idx_payment_intents_user_id ON payment_intents(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_status ON payment_intents(status);
CREATE INDEX IF NOT EXISTS idx_payment_intents_stripe_payment ON payment_intents(stripe_payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_stripe_intent ON payment_intents(stripe_intent_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_created_at ON payment_intents(created_at DESC);

-- Webhook events indexes
CREATE INDEX IF NOT EXISTS idx_webhook_events_stripe_id ON stripe_webhook_events(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_type ON stripe_webhook_events(type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON stripe_webhook_events(processed);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON stripe_webhook_events(created_at DESC);

-- Render webhooks indexes
CREATE INDEX IF NOT EXISTS idx_render_webhooks_render_id ON render_webhooks(render_id);
CREATE INDEX IF NOT EXISTS idx_render_webhooks_type ON render_webhooks(type);

-- Credit packages indexes
CREATE INDEX IF NOT EXISTS idx_credit_packages_active ON credit_packages(is_active, sort_order);

-- Soft delete indexes (for all tables with deleted_at)
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_projects_deleted_at ON projects(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_renders_deleted_at ON renders(deleted_at) WHERE deleted_at IS NULL;

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_renders_project_status ON renders(project_id, status);
CREATE INDEX IF NOT EXISTS idx_payment_intents_user_status ON payment_intents(user_id, status);

-- Comments explaining index purposes
COMMENT ON INDEX idx_users_clerk_id IS 'Fast lookup by Clerk auth ID';
COMMENT ON INDEX idx_renders_user_status IS 'Dashboard query optimization';
COMMENT ON INDEX idx_credit_txs_user_created IS 'Transaction history queries';
COMMENT ON INDEX idx_payment_intents_stripe_payment IS 'Webhook processing lookup';
