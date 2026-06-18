# 🏗️ Savings Feature - Architecture Diagram

---

## Transaction Type Hierarchy

```
TransactionType
├── income (+balance, no impact on expense, no goal)
├── expense (-balance, affects budget, affects stats, optional goal)
├── savings (-balance, NO budget, NO stats, auto-goal update) ← NEW
├── withdrawal (-balance from source, +balance to cash, special 2-account)
├── borrow (+balance, no budget, no stats)
├── lend (-balance, no budget, no stats)
└── business (±balance, no budget, no stats)

KEY DIFFERENCE: savings = expense balance but expense stats
```

---

## Data Flow Diagram - Create Savings Transaction

```
┌─────────────────────────────────────────────────────────┐
│ User: Create Savings Transaction 500k → Goal "Du lịch" │
└─────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────┐
│ UI Form (AddTransaction)                                │
│  - type: 'savings'                                      │
│  - amount: 500000                                       │
│  - account_id: <ví chính>                              │
│  - goal_id: <uuid-du-lich>                             │
│  - date: 2026-06-18                                     │
└─────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────┐
│ useCreateTransaction() Hook                             │
│  Mutation Function                                      │
└─────────────────────────────────────────────────────────┘
              ↓
    ┌─────────────────────────────────────┐
    │ Step 1: INSERT transactions         │
    │ ├─ type: 'savings'                  │
    │ ├─ amount: 500000                   │
    │ ├─ goal_id: uuid                    │
    │ └─ user_id: authenticated user      │
    │                                     │
    │ RESPONSE: transaction with id       │
    └─────────────────────────────────────┘
              ↓
    ┌─────────────────────────────────────┐
    │ Step 2: SELECT accounts.balance     │
    │ WHERE account_id = <ví chính>      │
    │                                     │
    │ RESPONSE: balance = 2000000         │
    └─────────────────────────────────────┘
              ↓
    ┌─────────────────────────────────────┐
    │ Step 3: UPDATE accounts             │
    │ IF type = 'savings':                │
    │   balance -= 500000                 │
    │   (2000000 → 1500000)               │
    │                                     │
    │ RESPONSE: updated account           │
    └─────────────────────────────────────┘
              ↓
    ┌─────────────────────────────────────┐
    │ Step 3b: UPDATE goals               │
    │ IF goal_id:                         │
    │   SELECT current_amount WHERE id    │
    │   UPDATE current_amount += 500000   │
    │   (1000000 → 1500000)               │
    │                                     │
    │ RESPONSE: updated goal              │
    └─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────┐
│ onSuccess: Cache Invalidation                           │
│  - invalidate ['transactions', userId]                  │
│  - invalidate ['accounts', userId]                      │
│  - invalidate ['goals', userId]  ← NEW!                │
│  - snapshotDailyBalances()                              │
│  - navigate('/')                                        │
└─────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────┐
│ Result                                                  │
│ ✅ Account: 2M → 1.5M                                   │
│ ✅ Goal: 1M → 1.5M                                      │
│ ✅ NOT in totalExpense (excluded)                       │
│ ✅ NOT in budget (excluded)                             │
└─────────────────────────────────────────────────────────┘
```

---

## Statistics Flow - How Savings is Excluded

```
getTransactionStats(transactions[], categories[], targetDate)
│
├─ Filter transactions by month
│   allTransactions = [100k expense, 500k savings, 200k income, ...]
│
├─ Calculate totals
│   ├─ totalExpense = 100k  (excludes 500k savings)
│   ├─ totalIncome = 200k
│   └─ totalBorrow = 0
│
├─ Build category maps
│   ├─ if (type === 'expense') { expenseMap[cat] += amount }
│   ├─ if (type === 'income') { incomeMap[cat] += amount }
│   └─ if (type === 'savings') { /* SKIP - not added to any map */ }
│
├─ Calculate trends
│   ├─ weeklyTrends: only processes expense (500k savings ignored)
│   └─ dailyTrends: only processes expense (500k savings ignored)
│
└─ Calculate count
    thisMonthCount = filter(!['withdrawal', 'savings']).length
    = 2 (only expense + income, excludes savings)

RESULT:
├─ totalExpense: 100k ✅
├─ topCategories: only from expense ✅
├─ weeklyTrends: only expense ✅
├─ thisMonthCount: 2 ✅
└─ savings completely excluded from all stats ✅
```

---

## Database Schema - Savings Relationship

```
┌──────────────────┐
│    users         │
├──────────────────┤
│ id (PK)          │
│ email            │
│ ...              │
└────────┬─────────┘
         │
         ├──────────────────────┬──────────────────┐
         │                      │                  │
    ┌────▼──────────┐  ┌────────▼────────┐  ┌─────▼───────────┐
    │  transactions │  │    goals        │  │   accounts      │
    ├───────────────┤  ├─────────────────┤  ├─────────────────┤
    │ id (PK)       │  │ id (PK)         │  │ id (PK)         │
    │ user_id (FK)  │  │ user_id (FK)    │  │ user_id (FK)    │
    │ type          │  │ name            │  │ name            │
    │ amount        │  │ target_amount   │  │ balance         │
    │ account_id ───┼──┼────────────────►│  │ type            │
    │ category_id   │  │ current_amount  │  │ ...             │
    │ goal_id ──────┼──┼────────────────►│  │                 │
    │              │  │ status          │  │                 │
    │ date          │  │ icon, color     │  │                 │
    │ created_at    │  │ created_at      │  │ created_at      │
    └───────────────┘  └─────────────────┘  └─────────────────┘
    
NEW CONNECTION:
│ goal_id ──────────► Foreign key to goals.id
│                    (ON DELETE SET NULL)
│                    Tracks which goal the
│                    savings is linked to
```

---

## Update Transaction Flow - Savings

```
User: Update savings 500k → 700k (same goal)

┌─────────────────────────────────────────────────────────┐
│ Current State:                                          │
│ - Savings transaction: 500k, goal "Du lịch"            │
│ - Account: 1500k                                        │
│ - Goal current: 1500k                                  │
└─────────────────────────────────────────────────────────┘
              ↓
    ┌─────────────────────────────────────┐
    │ Step 1: GET old transaction         │
    │ type: 'savings', amount: 500        │
    │ goal_id: uuid-du-lich               │
    └─────────────────────────────────────┘
              ↓
    ┌─────────────────────────────────────┐
    │ Step 2: REVERT old (500k)           │
    │ Account: 1500k + 500k = 2000k       │
    │ Goal: 1500k - 500k = 1000k          │
    └─────────────────────────────────────┘
              ↓
    ┌─────────────────────────────────────┐
    │ Step 3: UPDATE transaction          │
    │ amount: 700k                        │
    └─────────────────────────────────────┘
              ↓
    ┌─────────────────────────────────────┐
    │ Step 4: APPLY new (700k)            │
    │ Account: 2000k - 700k = 1300k       │
    │ Goal: 1000k + 700k = 1700k          │
    └─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────┐
│ Final State:                                            │
│ - Savings transaction: 700k                            │
│ - Account: 1300k (net change: -200k) ✅                │
│ - Goal current: 1700k (net change: +200k) ✅           │
└─────────────────────────────────────────────────────────┘
```

---

## Delete Transaction Flow - Savings

```
User: Delete savings 500k (goal "Du lịch")

┌─────────────────────────────────────────────────────────┐
│ Current State:                                          │
│ - Savings transaction: 500k, goal "Du lịch"            │
│ - Account: 1500k                                        │
│ - Goal current: 1500k                                  │
└─────────────────────────────────────────────────────────┘
              ↓
    ┌─────────────────────────────────────┐
    │ Step 1: GET transaction             │
    │ type: 'savings', amount: 500        │
    │ goal_id: uuid-du-lich               │
    └─────────────────────────────────────┘
              ↓
    ┌─────────────────────────────────────┐
    │ Step 2: REVERT (undo savings)       │
    │ Account: 1500k + 500k = 2000k       │
    │ Goal: max(0, 1500k - 500k) = 1000k  │
    └─────────────────────────────────────┘
              ↓
    ┌─────────────────────────────────────┐
    │ Step 3: DELETE transaction          │
    │ WHERE id = transaction-uuid         │
    └─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────┐
│ Final State:                                            │
│ - Transaction: DELETED ✅                              │
│ - Account: 2000k (restored) ✅                          │
│ - Goal current: 1000k (reduced) ✅                      │
└─────────────────────────────────────────────────────────┘
```

---

## Component Dependency Tree

```
App
├── AddTransaction (form)
│   ├── useCreateTransaction() hook
│   │   ├── INSERT transactions
│   │   ├── UPDATE accounts (savings: balance -= amount)
│   │   ├── UPDATE goals (savings: current_amount += amount)
│   │   └── Invalidate caches
│   └── Goal selector (NEW)
│       ├── useGoals() hook
│       └── Filter active goals
│
├── EditTransaction (form)
│   ├── useUpdateTransaction() hook
│   │   ├── REVERT old (revert balance + goal)
│   │   ├── APPLY new (apply balance + goal)
│   │   └── Invalidate caches
│   └── Goal selector (NEW)
│
├── TransactionList
│   └── useTransactions() hook
│       ├── getTransactionStats()
│       │   ├── Exclude savings from stats
│       │   ├── Exclude savings from totals
│       │   └── Exclude savings from thisMonthCount
│       └── Display transactions
│
└── Goals
    ├── useGoals() hook
    └── Display goal progress
        └── Include savings-linked updates
```

---

## Cache Invalidation Pattern

```
BEFORE (Transaction CRUD):
┌─────────────────────────────────┐
│ Cache: ['transactions']          │
│ Cache: ['accounts']              │
│ Cache: ['goals']                 │
└─────────────────────────────────┘
              ↓
        Create Savings
              ↓
┌─────────────────────────────────┐
│ onSuccess:                       │
│ - invalidate ['transactions'] ✅  │
│ - invalidate ['accounts'] ✅      │
│ - invalidate ['goals'] ✅ NEW!    │
│ - snapshotDailyBalances()        │
│ - invalidate ['daily_balance_..] │
│ - navigate('/')                  │
└─────────────────────────────────┘
              ↓
┌─────────────────────────────────┐
│ AFTER: Fresh data re-fetched     │
│ - Transactions list updated      │
│ - Account balance updated        │
│ - Goal progress updated ← KEY!   │
└─────────────────────────────────┘
```

---

## Type Flow Comparison

```
EXPENSE                          SAVINGS                      INCOME
─────────────────────────────────────────────────────────────────────
Type: 'expense'                  Type: 'savings'              Type: 'income'
Amount: 100k                     Amount: 500k                 Amount: 200k

Balance:
-100k ✅                         -500k ✅                     +200k ✅

Budget:
Counts ❌                        Does NOT count ✅            Does NOT count ❌

Stats (totalExpense):
+100k ❌                         +0k ✅                       +0k ❌

Goal Progress:
-                                +500k ✅                     -

thisMonthCount:
Included ❌                      Excluded ✅                  Included ❌
```

---

## Query Execution Order - Create Savings

```
1. INSERT transactions
   └─ Fastest: Simple insert
   
2. SELECT accounts.balance
   └─ Fast: Single row lookup
   
3. UPDATE accounts
   └─ Fast: Single row update
   
4. SELECT goals.current_amount
   └─ Medium: Optional, depends on goal_id
   
5. UPDATE goals
   └─ Medium: Optional, depends on goal_id
   
6. Cache Invalidation (async)
   └─ Triggers re-fetches but doesn't block
   
7. Navigate
   └─ Happens after everything succeeds

TOTAL TIME: ~200-500ms depending on network
```

---

**Architecture Version:** 1.0.0  
**Last Updated:** June 18, 2026  
**Format:** Markdown with ASCII diagrams
