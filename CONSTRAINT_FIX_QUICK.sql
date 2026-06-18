-- Quick Fix: Add 'savings' to Database Constraints
-- Copy & paste this entire block into Supabase SQL Editor and click Run

ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_type_check;
ALTER TABLE categories ADD CONSTRAINT categories_type_check CHECK (type IN ('income', 'expense', 'withdrawal', 'borrow', 'lend', 'business', 'savings'));

ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_type_check;
ALTER TABLE transactions ADD CONSTRAINT transactions_type_check CHECK (type IN ('income', 'expense', 'withdrawal', 'borrow', 'lend', 'business', 'savings'));

-- Verify
SELECT constraint_name FROM information_schema.table_constraints WHERE table_name IN ('categories', 'transactions') AND constraint_type = 'CHECK';
