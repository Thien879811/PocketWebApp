# 🏦 Tính năng Tiết kiệm (Savings) - Tóm tắt các thay đổi

**Ngày cập nhật:** June 18, 2026  
**Phiên bản:** v1.0.0

---

## 📝 Mô tả Tính năng

Thêm loại giao dịch **`savings`** (tiết kiệm) vào hệ thống. Đây là loại giao dịch đặc biệt:
- ✅ **Trừ tiền khỏi ví** (giống expense)
- ✅ **Tự động cộng vào mục tiêu tiết kiệm** (nếu liên kết goal_id)
- ❌ **KHÔNG tính vào chi tiêu hàng tháng**
- ❌ **KHÔNG kiểm soát bởi ngân sách**

---

## 🔧 Các file được cập nhật

### 1. **src/features/transactions/types/transaction.schema.ts**
```typescript
// Thêm 'savings' vào enum type
type: z.enum([..., 'savings'])

// Thêm goal_id field (optional, để liên kết với mục tiêu)
goal_id: z.string().optional()
```

**Thay đổi:**
- Thêm `'savings'` vào enum `type`
- Thêm field `goal_id` để liên kết giao dịch savings với mục tiêu

---

### 2. **src/features/categories/types/category.schema.ts**
```typescript
// Thêm 'savings' vào enum type
type: z.enum([..., 'savings'])
```

**Thay đổi:**
- Thêm `'savings'` vào enum `type` của category

---

### 3. **src/features/transactions/hooks/useTransactionMutations.ts**

#### 3.1 useCreateTransaction
```typescript
// Thêm logic xử lý savings type:
if (data.type === 'savings') {
  // Giảm số dư tài khoản
  await supabase.from('accounts').update({ balance: (account.balance || 0) - data.amount })
  
  // Tự động cộng vào goal nếu có goal_id
  if (data.goal_id) {
    await supabase.from('goals').update({ 
      current_amount: (goal.current_amount || 0) + data.amount 
    })
  }
}
```

**Thay đổi:**
- Thêm branch mới cho `data.type === 'savings'`
- Tự động update `goals.current_amount` nếu `goal_id` được cung cấp
- Thêm `['goals']` vào cache invalidation

#### 3.2 useUpdateTransaction
```typescript
// Hoàn lại giao dịch cũ (nếu là savings):
if (oldTx.type === 'savings') {
  // Cộng lại số dư
  await supabase.from('accounts').update({ 
    balance: (oldAccount.balance || 0) + oldTx.amount 
  })
  
  // Trừ khỏi goal cũ
  if (oldTx.goal_id) {
    await supabase.from('goals').update({ 
      current_amount: Math.max(0, (goal.current_amount || 0) - oldTx.amount) 
    })
  }
}

// Áp dụng giao dịch mới (tương tự useCreateTransaction)
```

**Thay đổi:**
- Thêm logic hoàn lại (revert) cho savings khi sửa
- Thêm logic áp dụng (apply) cho savings mới
- Thêm `['goals']` vào cache invalidation

#### 3.3 useDeleteTransaction
```typescript
// Hoàn lại giao dịch savings:
if (tx.type === 'savings') {
  // Cộng lại số dư
  await supabase.from('accounts').update({ 
    balance: (account.balance || 0) + tx.amount 
  })
  
  // Trừ khỏi goal
  if (tx.goal_id) {
    await supabase.from('goals').update({ 
      current_amount: Math.max(0, (goal.current_amount || 0) - tx.amount) 
    })
  }
}
```

**Thay đổi:**
- Thêm logic hoàn lại cho savings khi xoá
- Thêm `['goals']` vào cache invalidation

---

### 4. **src/features/transactions/hooks/useTransactions.ts**

```typescript
// getTransactionStats()
thisMonthTx.forEach(tx => {
  if (!tx.category_id) return
  
  if (tx.type === 'expense') { ... }
  else if (tx.type === 'income') { ... }
  else if (tx.type === 'borrow') { ... }
  else if (tx.type === 'lend') { ... }
  // Note: 'savings' transactions are NOT included in category breakdowns
})

// Loại trừ savings khỏi thisMonthCount
thisMonthCount: thisMonthTx.filter(tx => !['withdrawal', 'savings'].includes(tx.type)).length
```

**Thay đổi:**
- Loại trừ `savings` khỏi category breakdowns (không tính vào `topCategories`)
- Loại trừ `savings` khỏi trend calculations (không tính vào `weeklyTrends`, `dailyTrends`)
- Thêm comment ghi chú rằng savings không được tính vào phân tích

---

### 5. **SYSTEM_OVERVIEW.md**

#### 5.1 Bảng Loại Giao dịch (Mục 5)
Thêm hàng mới vào bảng `TransactionType`:

| Type | Nhãn | Prefix | Tác động số dư | Tính vào ngân sách | Cộng vào mục tiêu |
|------|------|--------|---|---|---|
| `savings` | **Tiết kiệm** | `-` | `balance -= amount` | **Không** | **Có** |

#### 5.2 Cập nhật ghi chú về thisMonthCount (Mục 5)
```
> **Lưu ý quan trọng:** `thisMonthCount` **không tính** `withdrawal` và `savings`
```

#### 5.3 Cập nhật Flow Tạo Giao dịch (Mục 7.3)
```
Step 3: UPDATE accounts.balance theo loại giao dịch:
  ...
  ├─ savings (LOGIC MỚI):
  │   - balance -= amount  (trừ khỏi ví)
  │   - Nếu goal_id: tự động cộng goal.current_amount += amount
  ...

Step 4: onSuccess:
  invalidate ['transactions']
  invalidate ['accounts']
  invalidate ['goals']  ← NEW: cập nhật mục tiêu nếu có savings
```

#### 5.4 Thêm Section Mới: Tính năng Tiết kiệm (Mục 17)
Chi tiết mô tả:
- Khác biệt với expense
- Luồng giao dịch
- Loại trừ khỏi thống kê
- Xoá/Sửa giao dịch

#### 5.5 Cập nhật Điểm Rủi ro (Mục 16)
Thêm item mới:
```
| **Savings với goal tùy chọn** | goal_id là optional. Không có goal_id → không tự động update goal. | ℹ️ Thấp |
```

---

## 🔄 Luồng Dữ liệu Chi tiết

### Tạo giao dịch Savings
```
User tạo giao dịch savings 500k → goal "Du lịch"
↓
1. INSERT transactions { type: 'savings', amount: 500k, goal_id: <du_lich>, ... }
2. SELECT accounts.balance WHERE id = <ví_chính>
3. UPDATE accounts SET balance = balance - 500k
4. SELECT goals.current_amount WHERE id = <du_lich>
5. UPDATE goals SET current_amount = current_amount + 500k
6. Invalidate: ['transactions'], ['accounts'], ['goals']
7. Navigate('/')
↓
Kết quả: 
- ✅ Ví giảm 500k
- ✅ Mục tiêu "Du lịch" tăng 500k
- ❌ KHÔNG tính vào chi tiêu hàng tháng
```

### Sửa giao dịch Savings
```
User sửa giao dịch savings từ 500k → 700k
↓
1. Fetch giao dịch cũ (500k, goal "Du lịch")
2. HOÀN LẠI CŨ:
   - accounts.balance += 500k
   - goals.current_amount -= 500k
3. UPDATE transactions { amount: 700k }
4. ÁP DỤNG MỚI:
   - accounts.balance -= 700k
   - goals.current_amount += 700k
5. Invalidate: ['transactions'], ['accounts'], ['goals']
↓
Kết quả:
- ✅ Ví thay đổi từ -500k → -700k (net: -200k)
- ✅ Mục tiêu thay đổi từ +500k → +700k (net: +200k)
```

### Xoá giao dịch Savings
```
User xoá giao dịch savings 500k
↓
1. Fetch giao dịch (500k, goal "Du lịch")
2. HOÀN LẠI:
   - accounts.balance += 500k
   - goals.current_amount = max(0, current_amount - 500k)
3. DELETE transactions WHERE id
4. Invalidate: ['transactions'], ['accounts'], ['goals']
↓
Kết quả:
- ✅ Ví cộng lại 500k
- ✅ Mục tiêu trừ đi 500k
```

---

## 📊 Ảnh hưởng đến Thống kê

### Trước khi thêm Savings
```
Giao dịch:
- Ăn trưa: 100k (expense)
- Tiết kiệm: 500k (expense - TÍNH VÀO CHI TIÊU)

Thống kê:
- totalExpense = 600k
- thisMonthCount = 2
- Budget affected = YES
```

### Sau khi thêm Savings
```
Giao dịch:
- Ăn trưa: 100k (expense)
- Tiết kiệm: 500k (savings - KHÔNG TÍNH)

Thống kê:
- totalExpense = 100k (CHỈ tính expense, loại trừ savings)
- thisMonthCount = 1 (loại trừ savings)
- Budget affected = NO
```

---

## ✅ Testing Checklist

- [ ] Tạo giao dịch savings mà có goal_id → kiểm tra goal.current_amount tăng
- [ ] Tạo giao dịch savings mà không có goal_id → kiểm tra không lỗi
- [ ] Sửa giao dịch savings → kiểm tra cả hoàn lại cũ và áp dụng mới
- [ ] Xoá giao dịch savings → kiểm tra goal.current_amount giảm
- [ ] Kiểm tra thống kê Stats → savings KHÔNG tính vào totalExpense
- [ ] Kiểm tra dashboard → thisMonthCount không tính savings
- [ ] Kiểm tra ngân sách → savings KHÔNG ảnh hưởng đến budget
- [ ] Kiểm tra trends → savings KHÔNG tính vào dailyTrends, weeklyTrends

---

## 🚨 Ghi chú quan trọng

1. **Savings không tự động cập nhật goal nếu không có goal_id**
   - Cần UI yêu cầu user chọn goal khi tạo savings transaction
   - Hoặc cần validation để goal_id bắt buộc

2. **Chỉnh sửa schema database**
   - Cần thêm cột `goal_id` vào bảng `transactions` nếu chưa có
   - Type: `UUID` (foreign key → `goals.id`)
   - Nullable: YES

3. **Migration Supabase**
   ```sql
   ALTER TABLE transactions ADD COLUMN goal_id UUID REFERENCES goals(id) ON DELETE SET NULL;
   ```

4. **UI Components**
   - Form AddTransaction cần thêm select "Mục tiêu" cho loại savings
   - Form EditTransaction cần hiển thị goal được liên kết
   - Category selection cần bao gồm category type=savings

---

## 📚 Liên quan

- SYSTEM_OVERVIEW.md: Mục 17 - Tính năng Tiết kiệm
- Transaction Schema: `src/features/transactions/types/transaction.schema.ts`
- Category Schema: `src/features/categories/types/category.schema.ts`
- Transaction Mutations: `src/features/transactions/hooks/useTransactionMutations.ts`
- Transaction Stats: `src/features/transactions/hooks/useTransactions.ts`
