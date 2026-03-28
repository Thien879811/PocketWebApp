# VAI TRÒ
Hãy đóng vai là một Senior React Architect và chuyên gia về Progressive Web Apps (PWA). Nhiệm vụ của bạn là thiết lập cấu trúc dự án (project scaffold) chuẩn production cho một ứng dụng React PWA hiện đại.

# TECH STACK YÊU CẦU
1. **Core:** React 18+ (sử dụng Vite).
2. **Styling:** Tailwind CSS (cấu hình mobile-first).
3. **Routing:** React Router DOM (v6+).
4. **HTTP Client:** Axios (dùng làm fetcher cho React Query).
5. **Server State:** TanStack Query (React Query v5).
6. **Client State:** Zustand (quản lý UI state, Auth state cục bộ).
7. **Forms:** React Hook Form + Zod (validation).
8. **PWA:** vite-plugin-pwa (manifest, service worker, offline support).

# YÊU CẦU CHI TIẾT

## 1. Cấu trúc thư mục (Folder Structure)
Hãy đề xuất cấu trúc thư mục scalable (có thể mở rộng), ưu tiên phân chia theo **Features** (tính năng) hoặc **Layers** rõ ràng.
- Yêu cầu bắt buộc: Tách biệt `layouts` (để xử lý việc layout Mobile khác Desktop).
- Yêu cầu bắt buộc: Thư mục `api` (axios config + react query hooks), `store` (zustand), `components` (shared UI).
- Tổ chức các custom hooks cho React Query vào thư mục riêng (ví dụ: `features/auth/api/useLogin.ts`).

## 2. Cấu hình PWA (Quan trọng)
- Cấu hình `vite-plugin-pwa` trong `vite.config.js`.
- `manifest.json`: Phải có `display: "standalone"` để khi cài đặt trên điện thoại sẽ ẩn thanh trình duyệt (giống app native).
- Cấu hình Service Worker: Chiến lược `NetworkFirst` cho API data (để luôn có dữ liệu mới khi có mạng) và `CacheFirst` cho static assets.
- Hỗ trợ update tự động khi có version mới (New content available).

## 3. Tích hợp Libraries & Patterns
- **Axios + React Query:** 
  - Tạo axios instance có interceptors (attach token, handle 401 global).
  - Tạo custom hook `useQuery`/`useMutation` wrapper hoặc hướng dẫn cách gọi API trong React Query sao cho tận dụng được axios interceptors.
- **Zustand:** 
  - Chỉ dùng cho Client State (ví dụ: `isSidebarOpen`, `userProfile` cache, `theme`).
  - Tránh lưu trữ dữ liệu API vào Zustand (vì đã có React Query lo).
- **React Hook Form:** 
  - Tạo ví dụ Form mẫu có integration với React Query mutation (ví dụ: Login form submit -> mutate -> onSuccess -> navigate).
- **Router:** 
  - Cấu trúc routing bảo vệ (Protected Routes) dựa trên trạng thái auth từ Zustand hoặc React Query.

## 4. Chiến lược Responsive (Mobile vs Desktop)
- Dự án phải hỗ trợ 2 chế độ giao diện rõ rệt thông qua Tailwind breakpoints:
  - **Mobile (< 768px):** Giao diện dạng App (Bottom Navigation Bar, Full width, Hide sidebar).
  - **Desktop (>= 768px):** Giao diện dạng Web (Sidebar cố định bên trái, Content giới hạn chiều rộng, Hide bottom nav).
- Hướng dẫn cách tổ chức `MainLayout` component để switch giữa 2 chế độ này dễ dàng mà không cần reload trang.

# ĐẦU RA (OUTPUT)
1. **Cây thư mục dự án (Directory Tree):** Hiển thị rõ ràng cấu trúc file.
2. **Lệnh cài đặt:** Các câu lệnh `npm install` cần thiết cho toàn bộ stack.
3. **Code cấu hình chính:** 
   - `vite.config.js` (với PWA config).
   - `src/main.jsx` (Setup QueryClientProvider, Router, Zustand Provider).
   - `src/lib/axios.js` (Axios instance).
   - `src/lib/queryClient.js` (React Query config).
   - `src/store/useAppStore.js` (Zustand mẫu).
   - `src/layouts/MainLayout.jsx` (Logic chuyển đổi Mobile/Desktop).
   - `src/features/auth/hooks/useLogin.ts` (Ví dụ React Query + Axios + RHF).
4. **Hướng dẫn ngắn:** Cách chạy dự án, cách test PWA (build & preview), và cách kiểm tra responsive.

# LƯU Ý
- Code phải sạch, tuân thủ chuẩn ESLint, sử dụng TypeScript (nếu có thể) hoặc JavaScript hiện đại.
- Ưu tiên hiệu suất (Code splitting, lazy loading routes).
- Đảm bảo trải nghiệm người dùng (UX) mượt mà khi chuyển mạng (offline/online).