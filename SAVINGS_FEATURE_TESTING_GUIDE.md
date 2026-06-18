# 🧪 Savings Feature - Testing Guide

**Feature:** Tiết kiệm (Savings) Transaction Type  
**Test Date:** June 18, 2026  
**Status:** Ready for QA

---

## 📋 Pre-Test Setup

Before running tests, ensure:

1. ✅ Database migration applied (`DATABASE_MIGRATION_SAVINGS.sql`)
2. ✅ All code changes implemented
3. ✅ Application rebuilt and running
4. ✅ User logged in with test account
5. ✅ At least one active goal exists
6. ✅ At least one savings category exists

---

## 🧬 Unit Tests

### Test Suite 1: Schema Validation

#### Test 1.1: TransactionSchema accepts 'savings' type
```
Input: { type: 'savings', amount: 500, ... }
Expected: ✅ Validation passes
Actual: ___________
Status: PASS / FAIL
```

#### Test 1.2: TransactionSchema allows optional goal_id
```
Input: { type: 'savings', goal_id: 'goal-123', ... }
Expected: ✅ Validation passes
Actual: ___________
Status: PASS / FAIL
```

#### Test 1.3: CategorySchema accepts 'savings' type
```
Input: { name: 'Tiết kiệm', type: 'savings', ... }
Expected: ✅ Validation passes
Actual: ___________
Status: PASS / FAIL
```

---

## 🔄 Integration Tests

### Test Suite 2: Create Savings Transaction

#### Test 2.1: Create savings with goal_id
```
Setup:
  - Account balance: 2,000,000
  - Goal target: 5,000,000, current: 1,000,000

Action:
  - Create transaction: type=savings, amount=500,000, goal_id='<goal-uuid>'

Expected Results:
  - ✅ Transaction created with id
  - ✅ Account balance: 1,500,000 (decreased by 500k)
  - ✅ Goal current_amount: 1,500,000 (increased by 500k)
  - ✅ Transaction not counted in thisMonthCount
  - ✅ Transaction not in totalExpense

Actual Results:
  - Account balance: ___________
  - Goal current_amount: ___________
  - thisMonthCount: ___________
  - totalExpense: ___________

Status: PASS / FAIL
Notes: ___________
```

#### Test 2.2: Create savings without goal_id
```
Setup:
  - Account balance: 2,000,000

Action:
  - Create transaction: type=savings, amount=500,000, goal_id=null

Expected Results:
  - ✅ Transaction created successfully
  - ✅ Account balance: 1,500,000
  - ✅ No errors
  - ✅ Query doesn't fail when goal_id is null

Actual Results:
  - Account balance: ___________
  - Error message: ___________

Status: PASS / FAIL
Notes: ___________
```

#### Test 2.3: Savings excludes from thisMonthCount
```
Setup:
  - Current month transactions: 1 expense, 1 savings

Action:
  - Call getTransactionStats()

Expected Results:
  - ✅ thisMonthCount = 1 (only expense)
  - ✅ totalExpense = amount of expense only

Actual Results:
  - thisMonthCount: ___________
  - totalExpense: ___________

Status: PASS / FAIL
Notes: ___________
```

---

### Test Suite 3: Update Savings Transaction

#### Test 3.1: Update savings amount with same goal
```
Setup:
  - Existing savings: 500k, goal current: 1,500k
  - Account balance: 1,500k

Action:
  - Update savings: amount = 700,000

Expected Results:
  - ✅ Old savings reverted: account +500k → 2,000k
  - ✅ Goal reverted: current -500k → 1,000k
  - ✅ New savings applied: account -700k → 1,300k
  - ✅ New goal applied: current +700k → 1,700k

Actual Results:
  - Account balance: ___________
  - Goal current_amount: ___________
  - Transaction amount: ___________

Status: PASS / FAIL
Notes: ___________
```

#### Test 3.2: Update savings to change goal
```
Setup:
  - Savings: 500k, linked to goal A (current: 1,500k)
  - Goal B (current: 1,000k)
  - Account: 1,500k

Action:
  - Update savings: change goal_id from A to B

Expected Results:
  - ✅ Goal A reverted: 1,500k - 500k = 1,000k
  - ✅ Goal B increased: 1,000k + 500k = 1,500k
  - ✅ Account unchanged: 1,500k

Actual Results:
  - Goal A current_amount: ___________
  - Goal B current_amount: ___________
  - Account balance: ___________

Status: PASS / FAIL
Notes: ___________
```

#### Test 3.3: Update savings to remove goal link
```
Setup:
  - Savings: 500k, linked to goal (current: 1,500k)

Action:
  - Update savings: set goal_id = null

Expected Results:
  - ✅ Goal reverted: current_amount -= 500k
  - ✅ Account unchanged
  - ✅ Transaction updated successfully

Actual Results:
  - Goal current_amount: ___________
  - Account balance: ___________

Status: PASS / FAIL
Notes: ___________
```

---

### Test Suite 4: Delete Savings Transaction

#### Test 4.1: Delete savings with goal
```
Setup:
  - Savings: 500k, linked to goal (current: 1,500k)
  - Account: 1,500k

Action:
  - Delete transaction

Expected Results:
  - ✅ Account balance: 2,000k (reverted)
  - ✅ Goal current_amount: 1,000k (reverted)
  - ✅ Transaction deleted from database

Actual Results:
  - Account balance: ___________
  - Goal current_amount: ___________
  - Transaction count: ___________

Status: PASS / FAIL
Notes: ___________
```

#### Test 4.2: Delete savings without goal
```
Setup:
  - Savings: 500k, goal_id=null
  - Account: 1,500k

Action:
  - Delete transaction

Expected Results:
  - ✅ Account balance: 2,000k
  - ✅ No errors

Actual Results:
  - Account balance: ___________
  - Error: ___________

Status: PASS / FAIL
Notes: ___________
```

---

## 🎨 UI/UX Tests

### Test Suite 5: Form Interactions

#### Test 5.1: Add Transaction Form shows savings option
```
Action:
  - Navigate to /add
  - Click type dropdown

Expected Results:
  - ✅ "Tiết kiệm" option visible
  - ✅ Option selectable

Actual Results:
  - Option visible: YES / NO
  - Option selectable: YES / NO

Status: PASS / FAIL
Notes: ___________
```

#### Test 5.2: Selecting savings shows goal selector
```
Action:
  - Select type = "Tiết kiệm"
  - Look for goal selection field

Expected Results:
  - ✅ Goal selector appears/is enabled
  - ✅ Can select from available goals

Actual Results:
  - Goal selector visible: YES / NO
  - Goals loaded: YES / NO

Status: PASS / FAIL
Notes: ___________
```

#### Test 5.3: Goal selector filters savings goals
```
Setup:
  - Goals: "Du lịch" (active), "Xe hơi" (active), "Sách" (paused)

Action:
  - Select type = "Tiết kiệm"
  - Check goal dropdown options

Expected Results:
  - ✅ Shows active goals: "Du lịch", "Xe hơi"
  - ✅ Filters out paused/completed goals (optional)

Actual Results:
  - Goals shown: ___________

Status: PASS / FAIL
Notes: ___________
```

#### Test 5.4: Savings category appears in category list
```
Action:
  - Navigate to form
  - Check category list for type=savings

Expected Results:
  - ✅ Savings categories visible
  - ✅ Selectable without error

Actual Results:
  - Category visible: YES / NO

Status: PASS / FAIL
Notes: ___________
```

---

### Test Suite 6: Statistics & Reports

#### Test 6.1: Stats page excludes savings from expense
```
Setup:
  - Current month: 1 expense (100k), 1 savings (500k)

Action:
  - Navigate to /stats
  - Select type = "Expense"

Expected Results:
  - ✅ Display total: 100k (NOT 600k)
  - ✅ Only expense transactions shown in breakdown
  - ✅ Savings transaction NOT included

Actual Results:
  - Total shown: ___________
  - Categories: ___________

Status: PASS / FAIL
Notes: ___________
```

#### Test 6.2: Dashboard thisMonthCount excludes savings
```
Setup:
  - Month: 3 expenses, 2 savings, 1 income

Action:
  - Navigate to home dashboard
  - Check transaction count

Expected Results:
  - ✅ Count shows: 4 (3 expense + 1 income)
  - ✅ Savings NOT counted

Actual Results:
  - Count shown: ___________

Status: PASS / FAIL
Notes: ___________
```

#### Test 6.3: Goal progress increases with savings
```
Setup:
  - Goal "Du lịch": target 5M, current 1M
  - Create savings transaction 500k linked to goal

Action:
  - Navigate to /goals
  - Check goal progress

Expected Results:
  - ✅ Goal current: 1.5M (increased from 1M)
  - ✅ Progress bar updated
  - ✅ Percentage recalculated: 30% (1.5/5)

Actual Results:
  - Goal current: ___________
  - Progress: ___________

Status: PASS / FAIL
Notes: ___________
```

---

### Test Suite 7: Budget Interaction

#### Test 7.1: Budget NOT affected by savings
```
Setup:
  - Budget plan: 5M for month
  - Spent: 2M on expenses
  - Create savings: 500k

Action:
  - Check budget remaining

Expected Results:
  - ✅ Remaining = 3M (5M - 2M)
  - ✅ Savings NOT deducted
  - ✅ Budget warning NOT triggered

Actual Results:
  - Remaining shown: ___________
  - Budget warning: YES / NO

Status: PASS / FAIL
Notes: ___________
```

#### Test 7.2: Creating savings doesn't exceed budget
```
Setup:
  - Budget: 1M
  - Spent: 900k
  - Try to create savings: 500k

Action:
  - Submit savings transaction

Expected Results:
  - ✅ Savings created successfully
  - ✅ No budget exceeded warning
  - ✅ Account balance updated
  - ✅ Remaining budget still shows 100k

Actual Results:
  - Savings created: YES / NO
  - Budget warning: ___________

Status: PASS / FAIL
Notes: ___________
```

---

## 🔐 Edge Cases & Error Handling

### Test Suite 8: Edge Cases

#### Test 8.1: Goal amount overflow
```
Setup:
  - Goal current: 4,999,999
  - Goal target: 5,000,000
  - Create savings: 2,000,000

Action:
  - Submit savings transaction

Expected Results:
  - ✅ Goal current: 6,999,999 (exceeds target - allowed)
  - ✅ No error on overflow
  - ✅ Status may show "completed"

Actual Results:
  - Goal current: ___________
  - Status: ___________

Status: PASS / FAIL
Notes: ___________
```

#### Test 8.2: Delete savings with non-existent goal
```
Setup:
  - Savings linked to goal that was deleted externally
  - goal_id exists in transaction but goal doesn't exist

Action:
  - Delete savings transaction

Expected Results:
  - ✅ Deletion succeeds gracefully
  - ✅ No error about missing goal
  - ✅ Account balance restored

Actual Results:
  - Deletion succeeded: YES / NO
  - Error: ___________

Status: PASS / FAIL
Notes: ___________
```

#### Test 8.3: Concurrent savings to same goal
```
Setup:
  - Goal current: 1M
  - Two browser tabs open

Action:
  - Tab A: Create savings 200k
  - Tab B: Create savings 300k (simultaneously)

Expected Results:
  - ✅ Both transactions created
  - ✅ Goal current: 1.5M (200k + 300k added)
  - ✅ No data corruption

Actual Results:
  - Both created: YES / NO
  - Goal current: ___________

Status: PASS / FAIL
Notes: ___________
```

---

## 📈 Performance Tests

### Test Suite 9: Performance

#### Test 9.1: Stats calculation with many savings
```
Setup:
  - 1000+ transactions including 300+ savings
  - Load /stats page

Expected Results:
  - ✅ Page loads within 2 seconds
  - ✅ Stats calculated correctly
  - ✅ No freezing/lag

Actual Results:
  - Load time: ___________
  - CPU usage: ___________
  - Correct calculations: YES / NO

Status: PASS / FAIL
Notes: ___________
```

#### Test 9.2: Goal update performance
```
Setup:
  - Goal with 50+ linked savings transactions

Action:
  - Create new savings linked to goal
  - Update transaction with different goal
  - Delete savings

Expected Results:
  - ✅ Each operation completes within 1 second
  - ✅ Goal current_amount updates correctly
  - ✅ No database locks

Actual Results:
  - Create time: ___________
  - Update time: ___________
  - Delete time: ___________

Status: PASS / FAIL
Notes: ___________
```

---

## ✅ Sign-Off Checklist

- [ ] All Unit Tests: PASS
- [ ] All Integration Tests: PASS
- [ ] All UI/UX Tests: PASS
- [ ] All Edge Case Tests: PASS
- [ ] All Performance Tests: PASS
- [ ] Code review completed
- [ ] Documentation reviewed
- [ ] Database migration verified
- [ ] No console errors
- [ ] No network errors
- [ ] Responsive design tested (mobile/tablet/desktop)
- [ ] Accessibility tested (keyboard navigation)

---

## 📝 Test Summary

**Total Tests:** 30+  
**Passed:** _____  
**Failed:** _____  
**Skipped:** _____  

**Overall Status:** ____________

**Known Issues:**
1. ___________
2. ___________
3. ___________

**Recommendations:**
1. ___________
2. ___________
3. ___________

---

**QA Tester:** ___________  
**Date:** ___________  
**Signature:** ___________
