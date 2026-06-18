-- ============================================================
-- Atomic Transaction RPC Functions
-- Moves all balance logic into PostgreSQL stored functions
-- so each operation runs in a SINGLE database transaction.
-- If ANY step fails, EVERYTHING is rolled back automatically.
-- ============================================================

-- ---------------------------------------------------------
-- 1. CREATE TRANSACTION (atomic)
-- ---------------------------------------------------------
CREATE OR REPLACE FUNCTION create_transaction(
  p_user_id      UUID,
  p_amount       NUMERIC,
  p_type         TEXT,
  p_category_id  UUID,
  p_goal_id      UUID,
  p_date         TEXT,
  p_account_id   UUID,
  p_note         TEXT,
  p_fee          NUMERIC DEFAULT 0,
  p_due_date     TEXT DEFAULT NULL,
  p_person_name  TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_transaction JSON;
  v_account_balance NUMERIC;
  v_cash_record RECORD;
  v_goal_record RECORD;
  v_new_balance NUMERIC;
  v_is_plus BOOLEAN;
BEGIN
  -- 1. Insert the transaction
  INSERT INTO transactions (
    user_id, amount, type, category_id, goal_id,
    date, account_id, note, fee, due_date, person_name
  ) VALUES (
    p_user_id, p_amount, p_type, p_category_id, p_goal_id,
    p_date, p_account_id, p_note, p_fee, p_due_date, p_person_name
  )
  RETURNING to_json(transactions.*) INTO v_transaction;

  -- 2. Read current account balance
  SELECT balance INTO v_account_balance
  FROM accounts
  WHERE id = p_account_id;

  IF v_account_balance IS NULL THEN
    RAISE EXCEPTION 'Account not found: %', p_account_id;
  END IF;

  -- 3. Update balances based on transaction type
  IF p_type = 'withdrawal' THEN
    -- Decrease source account (includes fee)
    UPDATE accounts
    SET balance = v_account_balance - p_amount - COALESCE(p_fee, 0)
    WHERE id = p_account_id;

    -- Find and increase cash account
    SELECT id, balance INTO v_cash_record
    FROM accounts
    WHERE user_id = p_user_id AND type = 'cash'
    LIMIT 1;

    IF FOUND THEN
      UPDATE accounts
      SET balance = v_cash_record.balance + p_amount
      WHERE id = v_cash_record.id;
    END IF;

  ELSIF p_type = 'savings' THEN
    -- Decrease account balance
    v_new_balance := v_account_balance - p_amount;
    UPDATE accounts SET balance = v_new_balance WHERE id = p_account_id;

    -- If goal_id provided, increase goal's current_amount
    IF p_goal_id IS NOT NULL THEN
      SELECT id, current_amount INTO v_goal_record
      FROM goals WHERE id = p_goal_id;

      IF FOUND THEN
        UPDATE goals
        SET current_amount = COALESCE(v_goal_record.current_amount, 0) + p_amount
        WHERE id = p_goal_id;
      END IF;
    END IF;

  ELSE
    -- income, borrow, lend, business, expense
    v_is_plus := (p_type = 'income' OR p_type = 'borrow');

    IF v_is_plus THEN
      v_new_balance := v_account_balance + p_amount;
    ELSE
      v_new_balance := v_account_balance - p_amount;
    END IF;

    UPDATE accounts SET balance = v_new_balance WHERE id = p_account_id;
  END IF;

  -- 4. Snapshot daily balance
  PERFORM snapshot_balance(p_user_id, p_date);

  RETURN v_transaction;
END;
$$;


-- ---------------------------------------------------------
-- 2. UPDATE TRANSACTION (atomic)
-- ---------------------------------------------------------
CREATE OR REPLACE FUNCTION update_transaction(
  p_tx_id        UUID,
  p_user_id      UUID,
  p_amount       NUMERIC,
  p_type         TEXT,
  p_category_id  UUID,
  p_goal_id      UUID,
  p_date         TEXT,
  p_account_id   UUID,
  p_note         TEXT,
  p_fee          NUMERIC DEFAULT 0,
  p_due_date     TEXT DEFAULT NULL,
  p_person_name  TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_old_tx       RECORD;
  v_transaction  JSON;
  v_account_balance NUMERIC;
  v_new_balance  NUMERIC;
  v_is_plus      BOOLEAN;
  v_cash_record  RECORD;
  v_goal_record  RECORD;
BEGIN
  -- 1. Fetch old transaction
  SELECT * INTO v_old_tx
  FROM transactions WHERE id = p_tx_id;

  IF v_old_tx IS NULL THEN
    RAISE EXCEPTION 'Transaction not found: %', p_tx_id;
  END IF;

  -- 2. Revert old transaction's balance effects
  SELECT balance INTO v_account_balance
  FROM accounts WHERE id = v_old_tx.account_id;

  IF v_old_tx.type = 'withdrawal' THEN
    -- Revert source: add back amount + fee
    UPDATE accounts
    SET balance = v_account_balance + v_old_tx.amount + COALESCE(v_old_tx.fee, 0)
    WHERE id = v_old_tx.account_id;

    -- Revert cash: subtract amount
    SELECT id, balance INTO v_cash_record
    FROM accounts
    WHERE user_id = p_user_id AND type = 'cash'
    LIMIT 1;

    IF FOUND THEN
      UPDATE accounts
      SET balance = v_cash_record.balance - v_old_tx.amount
      WHERE id = v_cash_record.id;
    END IF;

  ELSIF v_old_tx.type = 'savings' THEN
    UPDATE accounts
    SET balance = v_account_balance + v_old_tx.amount
    WHERE id = v_old_tx.account_id;

    IF v_old_tx.goal_id IS NOT NULL THEN
      SELECT id, current_amount INTO v_goal_record
      FROM goals WHERE id = v_old_tx.goal_id;

      IF FOUND THEN
        UPDATE goals
        SET current_amount = GREATEST(0, COALESCE(v_goal_record.current_amount, 0) - v_old_tx.amount)
        WHERE id = v_old_tx.goal_id;
      END IF;
    END IF;

  ELSE
    v_is_plus := (v_old_tx.type = 'income' OR v_old_tx.type = 'borrow');
    IF v_is_plus THEN
      v_new_balance := v_account_balance - v_old_tx.amount;
    ELSE
      v_new_balance := v_account_balance + v_old_tx.amount;
    END IF;
    UPDATE accounts SET balance = v_new_balance WHERE id = v_old_tx.account_id;
  END IF;

  -- 3. Update the transaction record
  UPDATE transactions
  SET
    amount      = p_amount,
    type        = p_type,
    category_id = p_category_id,
    goal_id     = p_goal_id,
    date        = p_date,
    account_id  = p_account_id,
    note        = p_note,
    fee         = p_fee,
    due_date    = p_due_date,
    person_name = p_person_name
  WHERE id = p_tx_id
  RETURNING to_json(transactions.*) INTO v_transaction;

  -- 4. Apply new transaction's balance effects
  SELECT balance INTO v_account_balance
  FROM accounts WHERE id = p_account_id;

  IF p_type = 'withdrawal' THEN
    UPDATE accounts
    SET balance = v_account_balance - p_amount - COALESCE(p_fee, 0)
    WHERE id = p_account_id;

    SELECT id, balance INTO v_cash_record
    FROM accounts
    WHERE user_id = p_user_id AND type = 'cash'
    LIMIT 1;

    IF FOUND THEN
      UPDATE accounts
      SET balance = v_cash_record.balance + p_amount
      WHERE id = v_cash_record.id;
    END IF;

  ELSIF p_type = 'savings' THEN
    v_new_balance := v_account_balance - p_amount;
    UPDATE accounts SET balance = v_new_balance WHERE id = p_account_id;

    IF p_goal_id IS NOT NULL THEN
      SELECT id, current_amount INTO v_goal_record
      FROM goals WHERE id = p_goal_id;

      IF FOUND THEN
        UPDATE goals
        SET current_amount = COALESCE(v_goal_record.current_amount, 0) + p_amount
        WHERE id = p_goal_id;
      END IF;
    END IF;

  ELSE
    v_is_plus := (p_type = 'income' OR p_type = 'borrow');
    IF v_is_plus THEN
      v_new_balance := v_account_balance + p_amount;
    ELSE
      v_new_balance := v_account_balance - p_amount;
    END IF;
    UPDATE accounts SET balance = v_new_balance WHERE id = p_account_id;
  END IF;

  -- 5. Snapshot daily balance for the new date
  PERFORM snapshot_balance(p_user_id, p_date);

  -- If old date differs from new date, also snapshot old date
  IF v_old_tx.date IS DISTINCT FROM p_date THEN
    PERFORM snapshot_balance(p_user_id, v_old_tx.date);
  END IF;

  RETURN v_transaction;
END;
$$;


-- ---------------------------------------------------------
-- 3. DELETE TRANSACTION (atomic)
-- ---------------------------------------------------------
CREATE OR REPLACE FUNCTION delete_transaction(
  p_tx_id   UUID,
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_old_tx  RECORD;
  v_account_balance NUMERIC;
  v_new_balance NUMERIC;
  v_is_plus  BOOLEAN;
  v_cash_record RECORD;
  v_goal_record RECORD;
BEGIN
  -- 1. Fetch the transaction
  SELECT * INTO v_old_tx
  FROM transactions WHERE id = p_tx_id;

  IF v_old_tx IS NULL THEN
    RAISE EXCEPTION 'Transaction not found: %', p_tx_id;
  END IF;

  -- 2. Revert balances
  SELECT balance INTO v_account_balance
  FROM accounts WHERE id = v_old_tx.account_id;

  IF v_old_tx.type = 'withdrawal' THEN
    UPDATE accounts
    SET balance = v_account_balance + v_old_tx.amount + COALESCE(v_old_tx.fee, 0)
    WHERE id = v_old_tx.account_id;

    SELECT id, balance INTO v_cash_record
    FROM accounts
    WHERE user_id = p_user_id AND type = 'cash'
    LIMIT 1;

    IF FOUND THEN
      UPDATE accounts
      SET balance = v_cash_record.balance - v_old_tx.amount
      WHERE id = v_cash_record.id;
    END IF;

  ELSIF v_old_tx.type = 'savings' THEN
    UPDATE accounts
    SET balance = v_account_balance + v_old_tx.amount
    WHERE id = v_old_tx.account_id;

    IF v_old_tx.goal_id IS NOT NULL THEN
      SELECT id, current_amount INTO v_goal_record
      FROM goals WHERE id = v_old_tx.goal_id;

      IF FOUND THEN
        UPDATE goals
        SET current_amount = GREATEST(0, COALESCE(v_goal_record.current_amount, 0) - v_old_tx.amount)
        WHERE id = v_old_tx.goal_id;
      END IF;
    END IF;

  ELSE
    v_is_plus := (v_old_tx.type = 'income' OR v_old_tx.type = 'borrow');
    IF v_is_plus THEN
      v_new_balance := v_account_balance - v_old_tx.amount;
    ELSE
      v_new_balance := v_account_balance + v_old_tx.amount;
    END IF;
    UPDATE accounts SET balance = v_new_balance WHERE id = v_old_tx.account_id;
  END IF;

  -- 3. Delete the transaction
  DELETE FROM transactions WHERE id = p_tx_id;

  -- 4. Snapshot daily balance
  PERFORM snapshot_balance(p_user_id, v_old_tx.date);

  RETURN TRUE;
END;
$$;


-- ---------------------------------------------------------
-- Helper: snapshot_balance (upserts daily balance logs)
-- ---------------------------------------------------------
CREATE OR REPLACE FUNCTION snapshot_balance(
  p_user_id UUID,
  p_log_date TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_date TEXT;
  v_accounts RECORD;
BEGIN
  v_date := split_part(p_log_date, 'T', 1);

  FOR v_accounts IN
    SELECT id, balance FROM accounts WHERE user_id = p_user_id
  LOOP
    INSERT INTO daily_balance_logs (user_id, log_date, account_id, balance, updated_at)
    VALUES (p_user_id, v_date, v_accounts.id, COALESCE(v_accounts.balance, 0), NOW())
    ON CONFLICT (user_id, log_date, account_id)
    DO UPDATE SET
      balance = EXCLUDED.balance,
      updated_at = NOW();
  END LOOP;
END;
$$;
