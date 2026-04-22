# 📱 Pocket Web App (PWA) - Production Ready Starter

Pocket App là một ứng dụng web tiến tiến (Progressive Web App - PWA) được xây dựng với kiến trúc hiện đại, tập trung vào trải nghiệm **Mobile-First** và khả năng mở rộng (Scalability).

## 🚀 Tech Stack & Features

| Thành phần | Công nghệ | Mô tả |
| :--- | :--- | :--- |
| **Core** | React 19 (Vite 7) | Hiệu suất cao, hỗ trợ tốt nhất cho Concurrent features. |
| **Backend** | Supabase | Database (PostgreSQL), Auth, Realtime & Edge Functions. |
| **Styling** | Tailwind CSS v3 | Mobile-first breakpoints, Premium aesthetics. |
| **Routing** | React Router v7 | Định tuyến linh hoạt, hỗ trợ tốt cho PWA và SSR. |
| **Server State** | TanStack Query v5 | Quản lý cache API, Background refetching, Offline-first. |
| **Client State** | Zustand | UI state & Auth persistence (LocalStorage). |
| **Forms** | React Hook Form + Zod | Hiệu suất cao, Validation chặt chẽ, Hỗ trợ TypeScript. |
| **PWA** | vite-plugin-pwa | Service Worker (NetworkFirst), Full Manifest, Offline Support. |
| **Utilities** | Lucide & Material Symbols | Icons hiện đại & dynamic class management. |

---

## 🏗️ Cấu trúc thư mục (Project Structure)

Dự án được tổ chức theo hướng **Feature-based + Layered Architecture** để dễ dàng mở rộng:

```text
src/
├── api/             # API definition (axios instances)
├── assets/          # Static assets (images, global fonts)
├── components/      # Shared UI components (Button, Input, ProtectedRoute)
├── features/        # Business logic organized by feature (Auth, Dashboard, etc.)
│   └── auth/
│       ├── hooks/   # Custom hooks (useLogin, useRegister)
│       └── types/   # Validation schemas & TS interfaces
├── hooks/           # Common custom hooks
├── layouts/         # Layout systems (Mobile Bottom Nav vs Desktop Sidebar)
├── lib/             # Third-party configurations (QueryClient, Axios)
├── pages/           # Page entry points
├── routes/          # Centralized route configuration
├── store/           # Zustand stores
└── types/           # Global type definitions
```

---

## 🛠️ Hướng dẫn cài đặt & Chạy dự án

### 1. Cài đặt Dependencies
```bash
npm install
```

### 2. Biến môi trường (.env)
Tạo file `.env` ở thư mục gốc:
```env
VITE_API_URL=http://localhost:3000/api
```

### 3. Chạy Development Server
```bash
npm run dev
```

### 4. Build & Preview PWA (Để test Offline mode)
PWA chỉ hoạt động chính xác khi đã được build:
```bash
npm run build
npm run preview
```

---

## 🔧 Cấu hình chính (Key Configurations)

### PWA & Service Worker
- **Strategy:** `NetworkFirst` cho các API call (đảm bảo dữ liệu mới nhất khi có mạng).
- **Strategy:** `CacheFirst` cho Static Assets (CSS, JS, Images, Fonts).
- **Update:** Tự động phát hiện phiên bản mới và nhắc người dùng cập nhật.

### Responsive Strategy
- **Mobile (< 768px):** Menu dưới (`Bottom Navigation Bar`), giao diện tràn viền.
- **Desktop (>= 768px):** Menu trái (`Sidebar`), nội dung căn giữa với `max-width`.

---

## 📝 Coding Standards
- **Components:** Functional components với React Hooks.
- **TypeScript:** Nghiêm ngặt về type (tránh `any`).
- **Imports:** Sử dụng Alias `@/` để import sạch sẽ (ví dụ: `import api from '@/lib/axios'`).
- **Validation:** Luôn sử dụng Zod Schema cho dữ liệu form và API Response.

---

## 🏁 Lộ trình phát triển (Roadmap)
- [x] Phase 1: Setup Architecture & PWA Configuration.
- [x] Phase 2: Base Layout System (Mobile/Desktop switch).
- [x] Phase 3: Auth Module (Login logic with RHF/Zod/Zustand).
- [ ] Phase 4: Main Dashboard & CRUD operations.
- [ ] Phase 5: Dark Mode & Offline Sync (IndexedDB integration).
