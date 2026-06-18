# 🔧 How to Fix the Savings Constraint Error

**Error Message:**
```
{"code": "23514","message": "new row for relation \"categories\" violates check constraint \"categories_type_check\""}
```

**Problem:** The database has a CHECK constraint that only allows specific transaction types. The 'savings' type is not in the allowed list.

---

## ✅ Solution: Update Database Constraints

### Option 1: Using Supabase Console (Recommended for UI Users)

1. **Go to Supabase Dashboard**
   - Navigate to your project
   - Click "SQL Editor"

2. **Run the Migration Script**
   - Copy the SQL from `MIGRATION_ADD_SAVINGS_CONSTRAINT.sql`
   - Paste into SQL Editor
   - Click "Run"

3. **Verify the Changes**
   - Run verification query to confirm constraints updated

### Option 2: Using Command Line (For Developers)

```bash
# If you have Supabase CLI installed:
supabase db push --file MIGRATION_ADD_SAVINGS_CONSTRAINT.sql

# Or using psql directly:
psql -h your-host -U postgres -d your_db -f MIGRATION_ADD_SAVINGS_CONSTRAINT.sql
```

### Option 3: Manual SQL in Supabase

```sql
-- Drop old constraint
ALTER TABLE categories
DROP CONSTRAINT categories_type_check;

-- Add new constraint with 'savings'
ALTER TABLE categories
ADD CONSTRAINT categories_type_check 
CHECK (type IN ('income', 'expense', 'withdrawal', 'borrow', 'lend', 'business', 'savings'));

-- Same for transactions table
ALTER TABLE transactions
DROP CONSTRAINT transactions_type_check;

ALTER TABLE transactions
ADD CONSTRAINT transactions_type_check 
CHECK (type IN ('income', 'expense', 'withdrawal', 'borrow', 'lend', 'business', 'savings'));
```

---

## 🔍 What This Does

### Before
✗ Categories can only be: income, expense, withdrawal, borrow, lend, business  
✗ Creating 'savings' category → ERROR 23514

### After
✅ Categories can be: income, expense, withdrawal, borrow, lend, business, **savings**  
✅ Creating 'savings' category → SUCCESS ✅

---

## 📋 Step-by-Step (Supabase Console)

### Step 1: Open SQL Editor
```
Supabase Dashboard → Your Project → SQL Editor
```

### Step 2: Copy This SQL
```sql
-- Fix categories constraint
ALTER TABLE categories
DROP CONSTRAINT categories_type_check;

ALTER TABLE categories
ADD CONSTRAINT categories_type_check 
CHECK (type IN ('income', 'expense', 'withdrawal', 'borrow', 'lend', 'business', 'savings'));

-- Fix transactions constraint
ALTER TABLE transactions
DROP CONSTRAINT transactions_type_check;

ALTER TABLE transactions
ADD CONSTRAINT transactions_type_check 
CHECK (type IN ('income', 'expense', 'withdrawal', 'borrow', 'lend', 'business', 'savings'));
```

### Step 3: Click "Run"
- Wait for execution
- Should see "Success" ✅

### Step 4: Verify (Optional)
```sql
-- Check constraints were updated
SELECT constraint_name 
FROM information_schema.constraint_column_usage 
WHERE table_name IN ('categories', 'transactions');
```

---

## 🧪 Test the Fix

After applying the migration:

### Test 1: Create Savings Category
1. Open app → Settings → Manage Categories
2. Click "Thêm danh mục"
3. Name: "Du lịch"
4. Type: **"Tiết kiệm"** ← Should work now!
5. Icon: savings
6. Color: green
7. Click "Tạo danh mục"
8. ✅ Should create successfully (no error 23514)

### Test 2: Create Savings Transaction
1. Click "Giao dịch mới"
2. Amount: 500000
3. Type: **"Tiết kiệm"**
4. Category: Select "Du lịch"
5. Account: Select any account
6. Click "Lưu giao dịch"
7. ✅ Should save successfully

### Test 3: Verify in Database
```sql
-- Check if savings category exists
SELECT * FROM categories WHERE type = 'savings';

-- Check if savings transaction exists
SELECT * FROM transactions WHERE type = 'savings';
```

---

## 🚨 If You Get an Error

### Error: "Constraint already exists"
**Reason:** Constraint was already added  
**Solution:** That's fine! The constraint is already correct.

### Error: "Cannot drop constraint"
**Reason:** Constraint name doesn't match  
**Solution:** Check actual constraint name:
```sql
SELECT constraint_name 
FROM information_schema.table_constraints 
WHERE table_name = 'categories';
```

### Error: "Column type does not exist"
**Reason:** Wrong table  
**Solution:** Make sure you're running on correct tables: `categories` and `transactions`

---

## 📝 Files Created

| File | Purpose |
|------|---------|
| `MIGRATION_ADD_SAVINGS_CONSTRAINT.sql` | SQL script to update constraints |
| `HOW_TO_FIX_SAVINGS_CONSTRAINT.md` | This guide |

---

## ✅ Checklist After Fix

- [ ] Run migration SQL in Supabase
- [ ] Verify constraints were updated
- [ ] Try creating a savings category
- [ ] Try creating a savings transaction
- [ ] Both work without error 23514
- [ ] Proceed with testing

---

## 📞 Still Having Issues?

If the error persists:

1. **Check the constraint exists:**
   ```sql
   SELECT * FROM information_schema.table_constraints 
   WHERE table_name = 'categories' 
   AND constraint_type = 'CHECK';
   ```

2. **Check your version:**
   - Make sure you're in correct Supabase project
   - Verify table names are exactly: `categories`, `transactions`

3. **Try full migration:**
   - Run `DATABASE_MIGRATION_SAVINGS.sql` if you haven't
   - Then run this constraint fix

---

## 🎯 Summary

**Problem:** Database constraint doesn't allow 'savings' type  
**Solution:** Update CHECK constraints to include 'savings'  
**Time:** < 1 minute  
**Risk:** Very low - just updating constraints, no data loss  
**Result:** Can create savings categories and transactions ✅

---

**Status:** Ready to apply  
**File:** MIGRATION_ADD_SAVINGS_CONSTRAINT.sql  
**Next:** Run in Supabase SQL Editor
