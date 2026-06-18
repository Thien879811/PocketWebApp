-- ================================================================
-- Database Migration: Add Savings Feature Support
-- ================================================================
-- Purpose: Add goal_id column to transactions table to support
--          automatic goal progress tracking for savings transactions
-- 
-- Date: June 18, 2026
-- Version: 1.0.0
-- ================================================================

-- Step 1: Add goal_id column to transactions table
-- This allows linking a savings transaction to a specific goal
ALTER TABLE transactions 
ADD COLUMN goal_id UUID REFERENCES goals(id) ON DELETE SET NULL;

-- Step 2: Add index for faster lookups of transactions by goal
CREATE INDEX idx_transactions_goal_id ON transactions(goal_id);

-- Step 3: Add composite index for efficient queries
CREATE INDEX idx_transactions_user_goal ON transactions(user_id, goal_id);

-- Step 4: (Optional) Add check constraint to ensure goal_id is only used for savings type
-- Note: Uncomment if you want to enforce this at the database level
-- ALTER TABLE transactions 
-- ADD CONSTRAINT check_goal_id_savings 
-- CHECK (
--   (type = 'savings' AND goal_id IS NOT NULL) OR 
--   (type != 'savings' AND goal_id IS NULL)
-- );

-- ================================================================
-- Rollback Script (if needed)
-- ================================================================
-- DROP INDEX IF EXISTS idx_transactions_user_goal;
-- DROP INDEX IF EXISTS idx_transactions_goal_id;
-- ALTER TABLE transactions DROP CONSTRAINT IF EXISTS check_goal_id_savings;
-- ALTER TABLE transactions DROP COLUMN IF EXISTS goal_id;

-- ================================================================
-- Verification Query
-- ================================================================
-- Run this to verify the migration was successful:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'transactions' AND column_name = 'goal_id';

-- Expected output:
-- column_name | data_type | is_nullable
-- goal_id     | uuid      | YES

-- ================================================================
-- Notes for Implementation
-- ================================================================
-- 
-- 1. The goal_id column is NULLABLE because:
--    - Not all savings transactions require a linked goal
--    - Users might create savings transactions independently
--    - Provides flexibility in the UI
--
-- 2. Foreign key behavior (ON DELETE SET NULL):
--    - If a goal is deleted, linked savings transactions remain but goal_id becomes NULL
--    - This prevents data loss
--    - Alternative: use ON DELETE CASCADE if you want to delete transactions with goal
--
-- 3. Indexes added for performance:
--    - idx_transactions_goal_id: Quick lookup of all transactions for a goal
--    - idx_transactions_user_goal: Optimized for user-specific goal queries
--
-- 4. Optional check constraint (currently commented out):
--    - Enforces that goal_id is ONLY used for savings type transactions
--    - Prevents accidental goal_id assignment to other transaction types
--    - Can be added later if needed
--
-- ================================================================
