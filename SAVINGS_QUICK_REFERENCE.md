# 🚀 Savings Feature - Quick Reference

**TL;DR - What Changed**

```
✅ Added 'savings' transaction type
✅ Savings auto-increases linked goal progress  
✅ Savings NOT counted in expense stats
✅ Savings NOT counted in budget
✅ Savings just decrease wallet balance
```

---

## 📚 Key Concepts

| Concept | Details |
|---------|---------|
| **Savings Type** | New transaction type: `'savings'` |
| **Goal Link** | Optional `goal_id` field in transaction |
| **Balance Impact** | Decreases account balance (like expense) |
| **Budget Impact** | ❌ Does NOT count toward budget |
| **Stat Impact** | ❌ Does NOT count in totalExpense |
| **Goal Impact** | ✅ Automatically increases goal.current_amount |

---

## 🔄 Data Flow

```
User creates SAVINGS transaction (500k) for Goal "Du lịch"

    ↓
    
Account.balance -= 500k  →  (2,000k → 1,500k)
Goal.current_amount += 500k  →  (1M → 1.5M)

    ↓
    
Stats: totalExpense NOT changed (excludes savings)
Budget: NOT affected (excludes savings)
Goal: Progress updated (1.5M / 5M = 30%)
```

---

## 💾 Files Changed

| File | Changes | Lines |
|------|---------|-------|
| `transaction.schema.ts` | Add 'savings' type + goal_id field | +2 |
| `category.schema.ts` | Add 'savings' type | +1 |
| `useTransactionMutations.ts` | Add savings logic in 3 functions | +60 |
| `useTransactions.ts` | Exclude savings from stats | +5 |
| `SYSTEM_OVERVIEW.md` | Update 3 sections | +50 |

---

## 🔨 How to Use (Backend)

### Create Savings
```typescript
const { data, error } = await supabase
  .from('transactions')
  .insert({
    type: 'savings',
    amount: 500000,
    goal_id: 'uuid-of-goal',  // optional
    account_id: 'uuid-of-wallet',
    date: '2026-06-18',
    user_id: 'uuid-of-user'
  })
```

### Update Savings
```typescript
// Hook handles reverting old + applying new
const { mutate: updateTx } = useUpdateTransaction()
updateTx({
  id: 'transaction-id',
  data: { amount: 700000, goal_id: 'different-goal' }
})
```

### Delete Savings
```typescript
// Hook handles reverting balance + goal
const { mutate: deleteTx } = useDeleteTransaction()
deleteTx('transaction-id')
```

---

## 📊 Impact on Statistics

### Before
```
totalExpense = 600k  (100k expense + 500k savings)
thisMonthCount = 2
```

### After
```
totalExpense = 100k  (100k expense only)
thisMonthCount = 1   (savings excluded)
```

---

## ⚠️ Important Notes

### Mandatory DB Changes
```sql
-- MUST RUN THIS:
ALTER TABLE transactions ADD COLUMN goal_id UUID;
```

### Optional UI Elements
- Goal selector in Add/Edit form
- Savings indicator in transaction list
- Goal progress breakdown
- Savings by goal report

### No Impact On
- Budget calculations
- Expense analytics
- Monthly trends
- Category limits
- Income tracking

### Direct Impact On
- Goal progress
- Account balance
- Query cache (['goals'])
- thisMonthCount

---

## 🧪 Quick Test

```
Setup:
  Account: 2,000k
  Goal: 1,000k (target: 5M)

Test:
  Create savings: 500k → goal "Du lịch"

Expected:
  Account: 1,500k ✅
  Goal: 1,500k ✅
  Stats totalExpense: 0k ✅
```

---

## 🎯 Next Steps

1. **Database:** Run migration script
2. **Frontend:** Add goal selector to form
3. **QA:** Test using testing guide
4. **Deploy:** Follow checklist

---

## 📖 Full Documentation

| Document | When to Read |
|----------|--------------|
| `SAVINGS_FEATURE_SUMMARY.md` | Need detailed breakdown |
| `DATABASE_MIGRATION_SAVINGS.sql` | Need to apply migration |
| `SAVINGS_FEATURE_TESTING_GUIDE.md` | Running QA tests |
| `SAVINGS_FEATURE_IMPLEMENTATION_CHECKLIST.md` | Project tracking |
| `SYSTEM_OVERVIEW.md` (section 17) | System design details |

---

## ✅ Code Location Reference

| Feature | File | Function |
|---------|------|----------|
| Create logic | `useTransactionMutations.ts` | useCreateTransaction |
| Update logic | `useTransactionMutations.ts` | useUpdateTransaction |
| Delete logic | `useTransactionMutations.ts` | useDeleteTransaction |
| Stats logic | `useTransactions.ts` | getTransactionStats |
| Schema | `transaction.schema.ts` | transactionSchema |

---

## 🆘 Troubleshooting

**Goal not updating?**
- Check goal_id is provided
- Check goal exists and user owns it
- Check cache invalidation in onSuccess

**Balance not decreasing?**
- Check type='savings'
- Check amount is positive number
- Check account_id is valid

**Appearing in expense stats?**
- Check getTransactionStats excludes 'savings'
- Check thisMonthCount filter includes 'savings'

---

**Version:** 1.0.0  
**Last Updated:** June 18, 2026  
**Status:** Code Complete ✅
