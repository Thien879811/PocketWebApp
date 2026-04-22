# Danh Sách Công Nghệ Sử Dụng trong PocketWebApp

Tài liệu này mô tả chi tiết các công nghệ, thư viện và công cụ được sử dụng để phát triển dự án **PocketWebApp**.

## 1. Frontend Framework & Core
- **[React 19](https://react.dev/)**: Thư viện JavaScript phổ biến nhất để xây dựng giao diện người dùng. Phiên bản 19 mang lại hiệu năng tối ưu và các tính năng mới như Actions và Server Components.
- **[TypeScript](https://www.typescriptlang.org/)**: Ngôn ngữ lập trình dựa trên JavaScript, bổ sung thêm kiểm soát kiểu dữ liệu (static typing), giúp code an toàn và dễ bảo trì hơn.
- **[Vite 7](https://vitejs.dev/)**: Build tool thế hệ mới cực kỳ nhanh, giúp tăng tốc độ phát triển (HMR) và tối ưu hóa file output khi đóng gói sản phẩm.

## 2. Quản Lý Trạng Thái & Dữ Liệu (State Management & Data Fetching)
- **[Zustand](https://zustand-demo.pmnd.rs/)**: Thư viện quản lý trạng thái (global state) nhẹ nhàng, dễ sử dụng nhưng vô cùng mạnh mẽ, thay thế cho Redux phức tạp.
- **[TanStack Query (React Query) v5](https://tanstack.com/query/latest)**: Quản lý việc gọi API, cache dữ liệu, tự động làm mới (refetch) và đồng bộ trạng thái server với client.

## 3. Backend & Cơ Sở Dữ Liệu
- **[Supabase](https://supabase.com/)**: Nền tảng Backend-as-a-Service (BaaS) mã nguồn mở dựa trên PostgreSQL. Cung cấp:
  - **Database**: Lưu trữ dữ liệu giao dịch, ví, danh mục.
  - **Authentication**: Quản lý đăng nhập, đăng ký người dùng.
  - **Realtime**: Đồng bộ dữ liệu tức thì giữa các thiết bị.
  - **Edge Functions**: Xử lý logic phía server nếu cần.

## 4. Định dạng & Giao Diện (Styling & UI)
- **[Tailwind CSS v3](https://tailwindcss.com/)**: Utility-first CSS framework giúp thiết kế giao diện nhanh chóng, linh hoạt và tối ưu kích thước file CSS.
- **[Material Symbols](https://fonts.google.com/icons)**: Bộ icon hiện đại từ Google, mang lại vẻ ngoài chuyên nghiệp và đồng nhất (Material Design).
- **[Lucide React](https://lucide.dev/)**: Bộ sưu tập icon SVG tối giản, nhẹ và đẹp mắt.
- **Premium Design Concept**: Ứng dụng được thiết kế theo phong cách "Deep Space" với chế độ tối (Dark Mode) sang trọng, hiệu ứng Glassmorphism và các vi chuyển động (micro-animations) mượt mà.

## 5. Form & Validation
- **[React Hook Form](https://react-hook-form.com/)**: Thư viện quản lý form hiệu quả, giảm thiểu số lần render không cần thiết.
- **[Zod](https://zod.dev/)**: Thư viện dùng để định nghĩa schema và validate dữ liệu mạnh mẽ, tích hợp hoàn hảo với TypeScript.

## 6. Điều Hướng & Routing
- **[React Router DOM v7](https://reactrouter.com/)**: Thư viện điều hướng chuẩn cho React, hỗ trợ định tuyến linh hoạt và quản lý trạng thái URL.

## 7. Tính Năng PWA (Progressive Web App)
- **[Vite Plugin PWA](https://vite-pwa-org.netlify.app/)**: Biến ứng dụng web thành ứng dụng có thể cài đặt trên điện thoại và máy tính, hỗ trợ hoạt động ngoại tuyến (Offline) và lưu trữ cache.

## 8. Các Công Cụ Khác
- **Axios**: Hỗ trợ thực hiện các HTTP requests.
- **Clsx & Tailwind Merge**: Xử lý logic gộp các class CSS một cách gọn gàng.
- **ESLint & Prettier**: Đảm bảo chất lượng code và định dạng code thống nhất.

---
*Tài liệu này được cập nhật dựa trên cấu trúc thực tế của dự án.*
