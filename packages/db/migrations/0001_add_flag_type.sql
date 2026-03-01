-- Migration: add flag type column for ab_test and other typed flags
-- Run this migration against your production database.

ALTER TABLE flags
  ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'boolean';

-- Backfill: mark existing experiment flags as ab_test type
UPDATE flags SET type = 'ab_test' WHERE is_experiment = true AND type = 'boolean';
