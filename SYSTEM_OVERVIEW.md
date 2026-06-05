# PocketWebApp – Tài liệu mô tả hệ thống

> Tài liệu này được tổng hợp trực tiếp từ mã nguồn.
> Mục tiêu: giúp người đọc nắm kiến trúc, flow nghiệp vụ và **toàn bộ công thức tính chi phí / số dư** đang chạy trong ứng dụng.

---

## 1. Tổng quan

**PocketFlow** là PWA quản lý tài chính cá nhân. Ứng dụng có hai miền chức năng tách biệt hoàn toàn:

| Miền | Mô tả | Route gốc |
|------|--------|-----------|
| **PocketFlow** | Giao dịch, ví/tài khoản, danh mục, thống kê, mục tiêu tiết kiệm, kế hoạch ngân sách | `/` |
| **Relo** | Quản lý mối quan hệ: liên hệ, ngày kỷ niệm, lịch hẹn, sở thích, avatar | `/relo` |

---

## 2. Tech stack

| Lớp | Công nghệ |
|-----|-----------|
| UI | React 19 + TypeScript |
| Build | Vite 7 + vite-plugin-pwa |
| Routing | React Router DOM v7 (lazy load) |
| Server state | TanStack Query v5 |
| Client state | Zustand (persist localStorage) |
| Backend | Supabase (Auth, PostgreSQL, Realtime, Storage) |
| Form/Validate | React Hook Form + Zod |
| Style | Tailwind CSS 3, clsx, tailwind-merge |
| Charts | PrimeReact Chart (Chart.js) |
| Icons | Lucide React + Google Material Symbols |
| Notifications | react-hot-toast |

---

## 3. Kiến trúc tổng thể

```
src/
├── main.tsx              ← Entry point
├── App.tsx               ← Bootstrap: Auth, Theme, PWA, Providers
├── routes/index.tsx      ← Tất cả route định nghĩa (lazy load)
├── layouts/              ← MainLayout, ReloLayout
├── pages/                ← Home, Login, Register, Stats, Settings, AISettings
├── components/           ← Shared components (MonthSelector, Loading, CategoryDetailModal…)
├── features/
│   ├── auth/             ← useLogin, useRegister + Zod schema
│   ├── transactions/     ← CRUD + getTransactionStats + snapshotDailyBalances
│   ├── accounts/         ← CRUD tài khoản + balance history
│   ├── categories/       ← CRUD danh mục
│   ├── goals/            ← CRUD mục tiêu tiết kiệm
│   ├── budget/           ← Kế hoạch ngân sách + getDailyBudgetStatus
│   ├── navigation/       ← Navigation cá nhân hoá
│   └── notifications/    ← Realtime toast
├── apps/relo/            ← Sub-app Relo (contacts, anniversaries, appointments…)
├── store/                ← useAuthStore, useThemeStore
├── lib/                  ← queryClient config, axios
└── utils/                ← supabase client, formatCurrency
```

---

## 4. Route map đầy đủ

| Route | Bảo vệ | Component | Chức năng |
|-------|--------|-----------|-----------|
| `/login` | Không | `Login` | Đăng nhập |
| `/register` | Không | `Register` | Đăng ký |
| `/` | Có | `Home` | Dashboard tổng quan |
| `/add` | Có | `AddTransaction` | Tạo giao dịch mới |
| `/edit/:id` | Có | `EditTransaction` | Sửa giao dịch |
| `/ledger` | Có | `Transactions` | Sổ giao dịch + filter |
| `/stats` | Có | `Stats` | Thống kê theo tháng/danh mục |
| `/wallet` | Có | `Wallet` | Quản lý ví/tài khoản |
| `/goals` | Có | `Goals` | Danh sách mục tiêu |
| `/goals/add` | Có | `AddGoal` | Tạo mục tiêu |
| `/goals/edit/:id` | Có | `EditGoal` | Sửa mục tiêu |
| `/budget` | Có | `BudgetPlanner` | Kế hoạch ngân sách |
| `/settings` | Có | `Settings` | Cài đặt |
| `/settings/categories` | Có | `Categories` | Quản lý danh mục |
| `/settings/categories/add` | Có | `AddCategory` | Thêm danh mục |
| `/settings/categories/edit/:id` | Có | `EditCategory` | Sửa danh mục |
| `/settings/ai` | Có | `AISettings` | Cài đặt AI |
| `/settings/budget-history` | Có | `BudgetHistory` | Lịch sử ngân sách |
| `/settings/budget-history/:id` | Có | `BudgetHistoryDetail` | Chi tiết ngân sách |
| `/settings/balance-history` | Có | `BalanceHistory` | Lịch sử snapshot số dư |
| `/relo` | Có | `Relo Dashboard` | Dashboard Relo |
| `/relo/contacts` | Có | `Contacts` | Danh sách liên hệ |
| `/relo/contacts/:id/edit` | Có | `EditContact` | Sửa liên hệ |
| `/relo/anniversaries` | Có | `Anniversaries` | Ngày kỷ niệm |
| `/relo/anniversaries/create` | Có | `CreateAnniversary` | Thêm ngày kỷ niệm |
| `/relo/anniversaries/edit/:id` | Có | `EditAnniversary` | Sửa ngày kỷ niệm |
| `/relo/appointments` | Có | `Appointments` | Lịch hẹn |
| `/relo/events/create` | Có | `CreateEvent` | Tạo sự kiện |
| `/relo/events/edit/:id` | Có | `EditEvent` | Sửa sự kiện |
| `/relo/preferences` | Có | `Preferences` | Sở thích liên hệ |
| `/relo/preferences/create` | Có | `CreatePreference` | Thêm sở thích |
| `/relo/preferences/edit/:id` | Có | `EditPreference` | Sửa sở thích |
| `/relo/settings` | Có | `ReloSettings` | Cài đặt Relo |
| `*` | — | `Navigate('/')` | Fallback |

---

## 5. Các loại giao dịch (TransactionType)

Đây là nền tảng của toàn bộ nghiệp vụ. Mỗi loại có quy tắc tác động số dư khác nhau:

| Type | Nhãn | Prefix | Tác động số dư tài khoản | Tính vào ngân sách? |
|------|------|--------|--------------------------|---------------------|
| `income` | Thu nhập | `+` | `balance += amount` | Không |
| `expense` | Chi tiêu | `-` | `balance -= amount` | **Có** |
| `withdrawal` | Rút tiền | `-` | Xem mục 7.3 (logic đặc biệt 2 tài khoản) | Không |
| `borrow` | Vay / Thu nợ | `+` | `balance += amount` | Không |
| `lend` | Cho vay / Trả nợ | `-` | `balance -= amount` | Không |
| `business` | Kinh doanh | `+` | `balance += amount` | Không |

> **Lưu ý quan trọng:** `thisMonthCount` (số giao dịch hiển thị trên dashboard) **không tính** giao dịch `withdrawal`.

---

## 6. Mô hình dữ liệu

### 6.1 Bảng tài chính PocketFlow

| Bảng | Cột chính | Ghi chú |
|------|-----------|---------|
| `transactions` | `id`, `user_id`, `amount`, `type`, `category_id`, `date`, `account_id`, `note`, `receipt_url`, `fee`, `created_at` | Mọi giao dịch. `fee` chỉ dùng cho `withdrawal`. |
| `accounts` | `id`, `user_id`, `name`, `balance`, `type`, `color`, `icon`, `limit`, `provider` | `type`: `cash`, `bank`, `credit`. Logic rút tiền tìm tài khoản `type = 'cash'`. |
| `categories` | `id`, `user_id`, `name`, `icon`, `type`, `color`, `limit` | `limit` là hạn mức chi tiêu (expense) hoặc mục tiêu thu nhập (income) theo danh mục. |
| `goals` | `id`, `user_id`, `name`, `target_amount`, `current_amount`, `target_date`, `icon`, `status`, `color` | `status`: `active`, `completed`, `paused`. |
| `budget_plans` | `id`, `user_id`, `total_budget`, `start_date`, `end_date`, `created_at`, `updated_at` | Một kỳ ngân sách. Nhiều kỳ có thể tồn tại; hệ thống dùng bản mới nhất. |
| `daily_balance_logs` | `id`, `user_id`, `log_date`, `account_id`, `balance`, `note`, `created_at`, `updated_at` | Snapshot số dư mỗi ngày. Upsert theo `(user_id, log_date, account_id)`. |
| `app_navigation` | `id`, `user_id`, `group_key`, `item_label`, `item_path`, `item_icon`, `sort_order`, `is_active` | Navigation cá nhân hoá từng user. |
| `notifications` | `id`, `user_id`, `title`, `message`, `link` | Realtime INSERT từ Supabase. |

### 6.2 Bảng Relo

| Bảng | Cột chính | Ghi chú |
|------|-----------|---------|
| `relo_contacts` | `id`, `user_id`, `name`, `relationship_type`, `avatar_url`, `birthday`, `notes`, `phone`, `email` | `relationship_type`: `partner`, `family`, `friend`, `other`. |
| `relo_anniversaries` | `id`, `user_id`, `contact_id`, `title`, `anniversary_date`, `is_recurring`, `reminder_days` | Join `relo_contacts(name, avatar_url)`. |
| `relo_appointments` | `id`, `user_id`, `contact_id`, `title`, `location`, `appointment_date`, `appointment_time`, `status` | `status`: `upcoming`, `completed`, `cancelled`. |
| `relo_preferences` | `id`, `user_id`, `contact_id`, `category`, `item`, `notes` | `category`: `food`, `hobby`, `gift`, `travel`, `other`. |

### 6.3 Storage

| Bucket | Path pattern | Giới hạn |
|--------|-------------|----------|
| `public-files` | `relo-contacts/{userId}/{timestamp}_{random}.{ext}` | JPEG/PNG/WebP/GIF, tối đa 5 MB |

---

## 7. Flow nghiệp vụ chi tiết

### 7.1 Khởi động ứng dụng & bảo vệ route

```
Browser load bundle
  → App.tsx:
      registerSW({ immediate: true })          ← Đăng ký service worker PWA
      useAuthStore.initialize()                ← getSession() từ Supabase
      useThemeStore.initializeTheme()          ← Đọc localStorage / system preference

  → React Router render routes
      → ProtectedRoute kiểm tra isInitialized
          ├── isInitialized = false  → Hiển thị LoadingScreen (chờ auth)
          ├── isAuthenticated = false → Navigate('/login')
          └── isAuthenticated = true  → Render layout + Outlet
```

### 7.2 Đăng nhập / Đăng ký

```
User nhập form → Zod validate → useLogin/useRegister hook
  → supabase.auth.signInWithPassword(email, password)   // đăng nhập
     hoặc supabase.auth.signUp(email, password)          // đăng ký
  → supabase.auth.onAuthStateChange(newSession)
      → useAuthStore.setSession(session)
          → navigate('/', replace: true)
```

### 7.3 Tạo giao dịch mới (flow quan trọng nhất)

Mỗi lần tạo giao dịch thực hiện **6 bước tuần tự** trên client:

```
Step 1: INSERT transactions (+ user_id)
          → trả về transaction mới

Step 2: SELECT accounts.balance WHERE id = account_id

Step 3: UPDATE accounts.balance theo loại giao dịch:

  ┌─ income  → balance += amount
  ├─ borrow  → balance += amount   (cùng logic với income)
  ├─ lend    → balance -= amount
  ├─ expense → balance -= amount
  ├─ business→ balance += amount
  └─ withdrawal (LOGIC ĐẶC BIỆT):
       SELECT accounts WHERE user_id AND type = 'cash'  ← tìm ví tiền mặt
       UPDATE source_account.balance -= (amount + fee)  ← trừ ngân hàng
       UPDATE cash_account.balance   += amount           ← cộng tiền mặt
       (fee bị mất, không cộng vào đâu)

Step 4: onSuccess:
          invalidate ['transactions']
          invalidate ['accounts']

Step 5: snapshotDailyBalances(userId, date)
          SELECT tất cả accounts của user
          UPSERT daily_balance_logs {user_id, log_date, account_id, balance}
          conflict target: (user_id, log_date, account_id)

Step 6: invalidate ['daily_balance_logs']
        navigate('/')
```

> **Điểm rủi ro:** Các bước thực hiện tuần tự bằng nhiều request riêng biệt. Nếu một bước thất bại giữa chừng, số dư có thể không nhất quán. Giải pháp an toàn hơn là dùng PostgreSQL RPC/transaction.

### 7.4 Sửa giao dịch (balance reversal)

Khi sửa giao dịch, hệ thống phải **hoàn lại số dư cũ** trước rồi mới **áp dụng số dư mới**:

```
Step 1: SELECT transaction cũ (lấy type, amount, fee, account_id)

Step 2: SELECT accounts.balance (tài khoản cũ)

Step 3: HOÀN LẠI số dư theo type cũ:
  ┌─ income/borrow → balance -= old.amount   (hoàn lại cộng)
  ├─ lend/expense  → balance += old.amount   (hoàn lại trừ)
  └─ withdrawal    → source_account += (old.amount + old.fee)
                     cash_account   -= old.amount

Step 4: UPDATE transactions SET ...new_data...

Step 5: SELECT accounts.balance (tài khoản mới - có thể khác tài khoản cũ)

Step 6: ÁP DỤNG số dư mới (giống Step 3 trong useCreateTransaction)

Step 7: onSuccess → invalidate + snapshotDailyBalances
```

### 7.5 Xoá giao dịch

```
Step 1: SELECT transaction (lấy type, amount, fee, account_id)

Step 2: SELECT accounts.balance (tài khoản của giao dịch)

Step 3: HOÀN LẠI số dư (logic giống Step 3 của useUpdateTransaction)
  ┌─ income/borrow → balance -= amount
  ├─ lend/expense  → balance += amount
  └─ withdrawal    → source_account += (amount + fee)
                     cash_account   -= amount

Step 4: DELETE transactions WHERE id

Step 5: onSuccess → invalidate + snapshotDailyBalances(userId, today)
```

> **Lưu ý:** Khi xoá, snapshot dùng `today` (không phải ngày của giao dịch bị xoá). Điều này có thể làm log ngày cũ không được cập nhật lại.

---

## 8. Công thức tính thống kê (`getTransactionStats`)

Hàm này chạy **hoàn toàn trên client** (không query DB). Input: toàn bộ mảng transactions + categories + targetDate.

### 8.1 Lọc theo tháng

```
thisMonthTx = transactions.filter(tx =>
  tx.date.getMonth() === targetDate.getMonth() &&
  tx.date.getFullYear() === targetDate.getFullYear()
)
```

### 8.2 Tổng thu/chi

```
totalIncome  = Σ amount  WHERE type = 'income'   (trong tháng)
totalExpense = Σ amount  WHERE type = 'expense'  (trong tháng)
totalBorrow  = Σ amount  WHERE type = 'borrow'   (trong tháng)
totalLend    = Σ amount  WHERE type = 'lend'     (trong tháng)
```

### 8.3 Phân tích theo danh mục (topCategories)

```
Với mỗi type (expense, income, borrow, lend):
  - Gom nhóm theo category_id
  - Tính tổng amount + count
  - Join metadata từ categories[] (name, icon, color, limit)
  - Sắp xếp giảm dần theo amount

Kết quả: topCategories, topIncomeCategories, topBorrowCategories, topLendCategories
```

### 8.4 Xu hướng theo tuần (weeklyTrends)

```
Chỉ tính giao dịch expense trong tháng.
weekIndex = min( floor((day - 1) / 7), 4 )   ← 5 tuần (index 0..4)
weeklyTrends[weekIndex] += amount
```

Phân bổ ngày vào tuần:
- Tuần 0: ngày 1–7
- Tuần 1: ngày 8–14
- Tuần 2: ngày 15–21
- Tuần 3: ngày 22–28
- Tuần 4: ngày 29+ (bị cap ở 4)

### 8.5 Xu hướng theo tháng trong năm (monthlyTrends)

```
Tính cho tất cả transactions (không chỉ tháng hiện tại) trong năm của targetDate.
Chỉ loại expense và income.

monthlyTrends[month]       += amount  (expense)
monthlyIncomeTrends[month] += amount  (income)
```

### 8.6 Xu hướng theo ngày trong tháng (dailyTrends)

```
Array kích thước = số ngày trong tháng

dailyTrends[day-1]        += amount  (expense)
dailyIncomeTrends[day-1]  += amount  (income)

Riêng type = 'business':
  - Nếu tên danh mục chứa 'thu' HOẶC 'income' → dailyBusinessTrends[day-1] += amount
  - Ngược lại                                  → dailyBusinessTrends[day-1] -= amount
```

### 8.7 Đếm giao dịch trong tháng

```
thisMonthCount = thisMonthTx.filter(tx => tx.type !== 'withdrawal').length
```

Giao dịch `withdrawal` bị loại khỏi tổng đếm vì đây là chuyển tiền nội bộ, không phải thu/chi thực sự.

---

## 9. Công thức tính ngân sách hàng ngày (`getDailyBudgetStatus`)

Đây là hệ thống **"rollover budget"** – phân bổ lại ngân sách chưa dùng sang các ngày còn lại.

### 9.1 Điều kiện áp dụng

```
Nếu targetDate < plan.start_date  → return null  (ngoài kỳ ngân sách)
Nếu targetDate > plan.end_date    → return null  (kỳ đã kết thúc)
```

### 9.2 Lọc giao dịch nằm trong kỳ ngân sách

```
planTransactions = transactions.filter(tx =>
  tx.type === 'expense'        &&    ← Chỉ chi tiêu
  tx.date >= plan.start_date   &&
  tx.date <= plan.end_date
)
```

> Các loại `withdrawal`, `borrow`, `lend`, `business`, `income` **không tính** vào ngân sách.

### 9.3 Phân tách chi tiêu theo ngày

```
spentBeforeTarget = Σ amount  WHERE date < targetDate
spentOnTargetDay  = Σ amount  WHERE date = targetDate
totalSpentSoFar   = Σ amount  (toàn bộ trong kỳ đến hết targetDate)
```

### 9.4 Công thức phân bổ ngân sách ngày (rollover)

```
remainingTotalAtStartOfDay = plan.total_budget - spentBeforeTarget
  → Ngân sách còn lại tính đến đầu ngày hôm nay (chưa tính chi tiêu hôm nay)

remainingDays = calculateDaysBetween(targetDate, plan.end_date)
  → Số ngày còn lại bao gồm targetDate
  → Công thức: ceil( |end - target| / 86400000 ) + 1

allocatedDaily = remainingTotalAtStartOfDay / remainingDays
  → Mức cho phép mỗi ngày (sau rollover)

remainingDaily = allocatedDaily - spentOnTargetDay
  → Còn lại trong ngày hôm nay = được phép - đã chi hôm nay

currentRemainingTotal = plan.total_budget - totalSpentSoFar
  → Tổng ngân sách còn lại sau khi tính hôm nay
```

### 9.5 Kết quả trả về

| Field | Ý nghĩa |
|-------|---------|
| `isExceeded` | `remainingDaily < 0` — đã chi quá mức hôm nay |
| `remainingDaily` | Số tiền còn được chi trong ngày hôm nay |
| `remainingTotal` | Tổng ngân sách còn lại trong toàn bộ kỳ |
| `allocatedDaily` | Mức được phép chi mỗi ngày (sau rollover) |
| `budgetEmpty` | `remainingTotal <= 0` — đã hết ngân sách toàn kỳ |
| `totalSpent` | Tổng đã chi trong kỳ (tính đến hết targetDate) |

### 9.6 Ví dụ minh hoạ

```
Kỳ ngân sách: 01/06 – 30/06, total_budget = 3.000.000đ
Hôm nay: 10/06

Chi tiêu trước ngày 10/06:
  05/06: Ăn uống 200.000
  07/06: Xăng    150.000
  08/06: Cà phê   50.000
  → spentBeforeTarget = 400.000

Chi tiêu ngày 10/06 đã có:
  10/06: Ăn trưa 80.000
  → spentOnTargetDay = 80.000

Tính toán:
  remainingTotalAtStartOfDay = 3.000.000 - 400.000 = 2.600.000
  remainingDays = (10/06 → 30/06) = 21 ngày
  allocatedDaily = 2.600.000 / 21 ≈ 123.809đ/ngày
  remainingDaily = 123.809 - 80.000 = 43.809đ

  → Hôm nay còn được chi thêm 43.809đ
  → isExceeded = false
  → budgetEmpty = false
  → totalSpent = 400.000 + 80.000 = 480.000
  → remainingTotal = 3.000.000 - 480.000 = 2.520.000
```

### 9.7 Cảnh báo vượt ngân sách trong form AddTransaction

```
isBudgetEmpty = currentPlan AND todayStatus.budgetEmpty AND type = 'expense'
willExceed    = currentPlan AND type = 'expense' AND currentAmount > targetRemaining

  → Nếu isBudgetEmpty: hiện thông báo "Ngân sách đã cạn"
  → Nếu willExceed:    hiện cảnh báo + rung điện thoại (navigator.vibrate(200))
  → Người dùng vẫn có thể lưu dù vượt ngân sách
```

---

## 10. Snapshot số dư hàng ngày (`snapshotDailyBalances`)

```
Được gọi trong onSuccess của: Create, Update, Delete transaction

Input: userId, logDate (ngày của giao dịch)

Logic:
  SELECT id, balance FROM accounts WHERE user_id = userId

  Với mỗi account:
    rows.push({ user_id, log_date: date, account_id, balance, updated_at })

  UPSERT daily_balance_logs
    ON CONFLICT (user_id, log_date, account_id)
    DO UPDATE SET balance, updated_at
```

Đây là cơ sở dữ liệu cho biểu đồ "Biến động số dư" (`/settings/balance-history`).

---

## 11. Flow thống kê trên màn hình Stats

```
Màn hình Stats (/stats)
  ├── useTransactions() → lấy tất cả transactions của user
  ├── useCategories()   → lấy categories
  └── getTransactionStats(transactions, categories, selectedDate)
       → Tính toán CLIENT-SIDE (không query DB thêm)

Hiển thị theo statsType: expense | income | borrow | lend

Hero card:
  displayTotal = tổng của statsType trong tháng chọn
  totalBudget  = Σ category.limit (chỉ categories của statsType đó)
  progress     = min(displayTotal / totalBudget * 100, 100)
  remainingBudget = max(totalBudget - displayTotal, 0)
  dailyLimit   = remainingBudget / daysLeft  (chỉ khi là tháng hiện tại)

Category breakdown:
  Với mỗi category của statsType:
    pct = cat.limit > 0 ? (cat.amount / cat.limit * 100) : (cat.amount / displayTotal * 100)
    Nếu cat.amount > cat.limit && type = 'expense' → hiện cảnh báo đỏ
    Nếu cat.amount >= cat.limit && type = 'income' → hiện thông báo đạt mục tiêu
```

> **Lưu ý phân biệt:** `getDailyBudgetStatus` dùng `budget_plans` (kỳ ngân sách tổng). Còn màn hình Stats dùng `category.limit` (hạn mức từng danh mục). Đây là **hai hệ thống kiểm soát chi tiêu độc lập**.

---

## 12. State management

### 12.1 useAuthStore

```
State: user, session, isAuthenticated, isInitialized

initialize():
  supabase.auth.getSession()
  → set user/session/isInitialized = true
  supabase.auth.onAuthStateChange((event, session))
  → update user/session/isAuthenticated khi session thay đổi

logout():
  supabase.auth.signOut()
  → clear user/session/isAuthenticated
```

### 12.2 useThemeStore

```
State: isDarkMode
Persist: localStorage key 'pocket-flow-theme'

initializeTheme():
  Đọc localStorage → nếu không có, dùng window.matchMedia('(prefers-color-scheme: dark)')
  Apply/remove class 'dark' trên document.documentElement

toggleTheme() / setTheme(isDark):
  Flip isDarkMode → apply class 'dark'
```

### 12.3 TanStack Query defaults

```
staleTime: 5 phút    → không refetch nếu data < 5 phút tuổi
gcTime: 24 giờ       → giữ cache offline 24 giờ
retry: 1             → thử lại 1 lần khi query lỗi
refetchOnWindowFocus: false
mutation retry: false
```

### 12.4 Query keys quan trọng

| Key | Dữ liệu |
|-----|---------|
| `['transactions', userId]` | Tất cả giao dịch |
| `['transaction', id]` | Một giao dịch |
| `['accounts', userId]` | Tất cả tài khoản/ví |
| `['categories', userId]` | Tất cả danh mục |
| `['goals', userId]` | Tất cả mục tiêu |
| `['active-budget', userId]` | Budget plan mới nhất |
| `['budget-by-date', userId, date]` | Budget plan bao gồm ngày `date` |
| `['budget-history', userId]` | Toàn bộ lịch sử budget plans |
| `['daily_balance_logs', userId]` | Snapshot số dư theo ngày |
| `['balance_history', userId]` | Balance logs join tên account |
| `['relo_contacts', userId]` | Liên hệ Relo |
| `['relo_anniversaries', userId]` | Ngày kỷ niệm Relo |
| `['relo_appointments', userId]` | Lịch hẹn Relo |
| `['relo_preferences', userId, contactId]` | Sở thích của liên hệ |

---

## 13. Realtime notifications

```
RealtimeNotifications component (mount trong App.tsx):

supabase.channel('public:notifications')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    toast(payload.new.title + ': ' + payload.new.message, {
      onClick: () => navigate(payload.new.link)  ← nếu có link
    })
  })
  .subscribe()
```

---

## 14. PWA & Service Worker

| Mục | Giá trị |
|-----|---------|
| App name | `PocketFlow Financial Atelier` |
| Short name | `PocketFlow` |
| Display | `standalone` (toàn màn hình, không thanh URL) |
| Orientation | `portrait` |
| SW update | `registerType: 'autoUpdate'` + `registerSW({ immediate: true })` |
| Static cache | `CacheFirst`, max 50 entries, 30 ngày |
| API cache | pattern `/https://api.*/`, `NetworkFirst`, max 100 entries, 24 giờ |

> ⚠️ Supabase thường có domain dạng `*.supabase.co`, **không** match pattern `/https://api.*/`. Cần bổ sung pattern nếu muốn cache offline request Supabase.

---

## 15. Biến môi trường

| Biến | Mục đích |
|------|----------|
| `VITE_SUPABASE_URL` | URL project Supabase |
| `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Anon/public key |
| `VITE_API_URL` | Base URL cho Axios (hiện không dùng trong luồng chính) |

---

## 16. Điểm cần chú ý & rủi ro kỹ thuật

| Điểm | Mô tả | Mức độ |
|------|-------|--------|
| **Race condition số dư** | 6 request độc lập client-side cho mỗi transaction. Lỗi giữa chừng gây mất nhất quán. | ⚠️ Cao |
| **RLS chưa xác nhận** | Code lọc `user_id` phía client, nhưng nếu Supabase RLS chưa bật, user có thể đọc/sửa data của nhau. | ⚠️ Cao |
| **useTransaction(id) không filter user_id** | Chỉ filter theo `id`. Dựa hoàn toàn vào RLS. | ⚠️ Trung bình |
| **Snapshot xoá giao dịch dùng ngày hiện tại** | Khi xoá giao dịch ngày cũ, snapshot chỉ cập nhật log hôm nay, không cập nhật ngày của giao dịch bị xoá. | ℹ️ Thấp |
| **Budget history invalidate thiếu** | Tạo/sửa/xoá budget chỉ invalidate `active-budget`, không invalidate `budget-history`. | ℹ️ Thấp |
| **withdrawal tìm cash account bằng `.single()`** | Nếu user có nhiều hơn 1 tài khoản `type = 'cash'`, sẽ lỗi. | ⚠️ Trung bình |
| **PWA cache không cover Supabase** | Domain Supabase không match pattern `https://api.*`. | ℹ️ Thấp |

---

## 17. Hướng dẫn nhanh cho developer mới

1. **Bootstrap:** `src/App.tsx` → `src/routes/index.tsx`
2. **Thêm màn hình mới:** Tạo page trong `src/features/<feature>/pages/`, thêm route lazy trong `src/routes/index.tsx`, bọc `<ProtectedRoute>` nếu cần đăng nhập.
3. **Thêm query mới:** Viết hook trong `src/features/<feature>/hooks/`, dùng `useQuery` + `queryKey` + `supabase.from().select()`.
4. **Thêm mutation mới:** Dùng `useMutation`, gọi `queryClient.invalidateQueries` trong `onSuccess`.
5. **Schema form:** Định nghĩa Zod schema trong `src/features/<feature>/types/*.schema.ts`, dùng `zodResolver` trong `useForm`.
6. **Sửa màu/theme:** CSS variables trong `src/index.css`. Tailwind tokens trong `tailwind.config.js`.
7. **Không dùng @apply với opacity modifier** (ví dụ `@apply text-primary/50`) trong file CSS — Tailwind không resolve được với CSS variable colors. Dùng `color-mix()` hoặc plain CSS thay thế.
