-- ================================================================
-- Migration: Add 'savings' to Database Constraints
-- ================================================================
-- Purpose: Update CHECK constraints in categories and transactions tables
--          to support the new 'savings' transaction type
--
-- Date: June 18, 2026
-- Version: 1.0.0
-- ================================================================

-- Step 1: Drop existing CHECK constraint on categories table
-- The constraint currently only allows: income, expense, withdrawal, borrow, lend, business
-- We need to add 'savings' to the allowed values

ALTER TABLE categories
DROP CONSTRAINT IF EXISTS categories_type_check;

-- Step 2: Add new CHECK constraint with 'savings' included
ALTER TABLE categories
ADD CONSTRAINT categories_type_check 
CHECK (type IN ('income', 'expense', 'withdrawal', 'borrow', 'lend', 'business', 'savings'));

-- Step 3: Drop existing CHECK constraint on transactions table (if it exists)
ALTER TABLE transactions
DROP CONSTRAINT IF EXISTS transactions_type_check;

-- Step 4: Add new CHECK constraint for transactions with 'savings' included
ALTER TABLE transactions
ADD CONSTRAINT transactions_type_check 
CHECK (type IN ('income', 'expense', 'withdrawal', 'borrow', 'lend', 'business', 'savings'));

-- ================================================================
-- Verification Query
-- ================================================================
-- Run this to verify the constraints were added:
-- SELECT constraint_name, constraint_definition 
-- FROM information_schema.table_constraints 
-- WHERE table_name IN ('categories', 'transactions') 
-- AND constraint_type = 'CHECK';

-- Expected result:
-- categories_type_check: type IN ('income', 'expense', 'withdrawal', 'borrow', 'lend', 'business', 'savings')
-- transactions_type_check: type IN ('income', 'expense', 'withdrawal', 'borrow', 'lend', 'business', 'savings')

-- ================================================================
-- Rollback Script (if needed)
-- ================================================================
-- ALTER TABLE categories DROP CONSTRAINT categories_type_check;
-- ALTER TABLE categories ADD CONSTRAINT categories_type_check 
-- CHECK (type IN ('income', 'expense', 'withdrawal', 'borrow', 'lend', 'business'));
--
-- ALTER TABLE transactions DROP CONSTRAINT transactions_type_check;
-- ALTER TABLE transactions ADD CONSTRAINT transactions_type_check 
-- CHECK (type IN ('income', 'expense', 'withdrawal', 'borrow', 'lend', 'business'));

-- ================================================================
