# Kiến trúc hệ thống Thông báo đẩy Firebase (FCM) - PocketFlow

Tài liệu này mô tả chi tiết toàn bộ luồng hoạt động, các thành phần hệ thống (Frontend & Backend) và cách thiết lập tính năng Thông báo đẩy (Push Notifications) qua Firebase Cloud Messaging (FCM) cho dự án PocketFlow.

---

## 1. Tổng quan Luồng hoạt động (Workflow)

Hệ thống được thiết kế hoàn toàn tự động và tách biệt (decoupled). Dù ứng dụng đang mở hay đã đóng, thông báo vẫn có thể được lên lịch và gửi thành công tới thiết bị.

1.  **Đăng ký thiết bị**: Trình duyệt xin quyền gửi thông báo -> Đăng ký Service Worker -> Lấy FCM Token -> Lưu token vào bảng `fcm_tokens` trên Supabase.
2.  **Gửi thông báo tức thì**: Bất cứ khi nào có bản ghi mới được `INSERT` vào bảng `notifications`, một Database Trigger sẽ được gọi, tự động bắn Webhook tới Supabase Edge Function (`send-fcm`) để đẩy thông báo qua Firebase.
3.  **Lên lịch thông báo (Background Cron)**: Người dùng tạo lịch trong bảng `scheduled_notifications`. Một Cron Job sẽ định kỳ gọi Edge Function để kiểm tra. Nếu đến giờ, Edge Function sẽ chuyển dữ liệu sang bảng `notifications`, kích hoạt quá trình gửi (bước 2) ngay cả khi người dùng không mở app.

---

## 2. Kiến trúc Frontend (React / Vite)

### 2.1. Service Worker tĩnh (`public/firebase-messaging-sw.js`)
*   **Chức năng**: Lắng nghe và hiển thị thông báo đẩy khi trình duyệt ở trạng thái nền (background) hoặc đã tắt ứng dụng.
*   **Bảo mật Config**: Vì file tĩnh không đọc được `.env` của Vite, Frontend truyền trực tiếp các biến môi trường Firebase (`apiKey`, `projectId`...) dưới dạng tham số URL (Query Parameters) khi đăng ký Service Worker. File này sẽ parse `location.search` để khởi tạo Firebase an toàn.

### 2.2. Đăng ký & Xin quyền (`src/features/notifications/RegisterNotification.tsx`)
*   **Chức năng**: Gọi `Notification.requestPermission()`. Nếu người dùng đồng ý, nó tiến hành đăng ký `firebase-messaging-sw.js` (đính kèm URL params).
*   Lấy FCM Token từ Firebase và thực hiện **Upsert** vào bảng `fcm_tokens` trên Supabase, gắn liền với `user_id` hiện tại.

### 2.3. Quản lý cài đặt (`src/pages/NotificationSettingsPage.tsx`)
*   Giao diện cho phép bật/tắt các loại thông báo (ngân sách, nhắc nợ...).
*   Hiển thị **Trạng thái kết nối Push FCM** (kiểm tra xem token của người dùng đã có trong Database chưa).
*   Form **Hẹn giờ thông báo tự chọn**: Dữ liệu từ form này được lưu thẳng vào bảng `scheduled_notifications`.

### 2.4. Công cụ Kiểm thử (`src/pages/SendPushNotification.tsx`)
*   Một trang công cụ UI cho phép bạn nhập User ID đích, Tiêu đề và Nội dung để gửi thông báo đẩy thử nghiệm ngay lập tức (Bằng cách `INSERT` vào bảng `notifications`).

---

## 3. Kiến trúc Backend (Supabase)

### 3.1. Cơ sở dữ liệu (Tables)
*   **`fcm_tokens`**: Lưu trữ FCM Token của các thiết bị. Mỗi người dùng có thể có nhiều thiết bị (token) khác nhau. Có thiết lập RLS để User chỉ xem được token của mình.
*   **`notifications`**: Bảng trung tâm. Bất kỳ tính năng nào muốn gửi thông báo chỉ cần `INSERT` vào bảng này.
*   **`scheduled_notifications`**: Lưu các thông báo được lên lịch hẹn giờ (cột `scheduled_at` và `sent`).

### 3.2. Database Trigger & Webhook
*   **Trigger `on_new_notification_push`**: Theo dõi bảng `notifications`. Mỗi khi có bản ghi mới, Trigger này sử dụng extension `pg_net` để gửi một HTTP POST Request (chứa dữ liệu của thông báo đó) tới Edge Function `send-fcm`.

### 3.3. Supabase Edge Function (`supabase/functions/send-fcm/index.ts`)
Đây là bộ não xử lý việc gửi thông báo, có 2 chế độ hoạt động:

*   **Chế độ Dispatch (Gửi tức thì qua Trigger)**:
    *   Nhận HTTP POST từ Trigger. Lấy `user_id` và truy vấn bảng `fcm_tokens` để lấy tất cả token của user đó.
    *   Sử dụng **Web Crypto API** để tự động ký JWT từ chuỗi `FIREBASE_SERVICE_ACCOUNT`, đổi lấy Access Token từ Google OAuth2.
    *   Gọi Firebase Cloud Messaging (FCM) v1 API để đẩy thông báo đến thiết bị. Tự động xóa token khỏi DB nếu token đó đã hết hạn.

*   **Chế độ Scheduler (Xử lý thông báo hẹn giờ)**:
    *   Nhận HTTP GET (hoặc `?check=true`).
    *   Truy vấn bảng `scheduled_notifications` tìm các bản ghi đã đến giờ (`scheduled_at <= now()`) và chưa gửi (`sent = false`).
    *   Copy các bản ghi này sang bảng `notifications` (để kích hoạt chế độ Dispatch ở trên) và đánh dấu `sent = true`.

---

## 4. Hướng dẫn cấu hình (Checklist Setup)

Để toàn bộ hệ thống này hoạt động trơn tru trên môi trường thực tế, bạn cần đảm bảo các thiết lập sau:

1.  **Môi trường Frontend (`.env`)**:
    *   Đảm bảo có đủ các biến `VITE_FIREBASE_*`.
    *   Bắt buộc phải có `VITE_FIREBASE_VAPID_KEY` (Web Push Certificate sinh ra từ Firebase Console).

2.  **Môi trường Edge Function (Supabase Secrets)**:
    Cần thiết lập các biến môi trường cho Edge Function `send-fcm`:
    *   `SUPABASE_URL` và `SUPABASE_SERVICE_ROLE_KEY`: Để Function có quyền truy vấn DB.
    *   `FIREBASE_SERVICE_ACCOUNT`: Nội dung file JSON chứa Service Account lấy từ Firebase (được stringify).

3.  **Supabase Database Webhook**:
    *   Đảm bảo bạn đã tạo Webhook trong Supabase Dashboard (Database -> Webhooks) lắng nghe sự kiện INSERT trên bảng `notifications` và trỏ về URL của Edge Function `send-fcm`.

4.  **Cấu hình Supabase Cron (Để chạy hẹn giờ)**:
    *   Truy cập **Supabase Dashboard -> Integrations -> Cron** (hoặc sử dụng pg_cron nếu thành thạo SQL).
    *   Tạo một Job chạy mỗi phút (Cron schedule: `* * * * *`).
    *   HTTP Method: `GET`.
    *   Endpoint: URL của Edge Function `send-fcm` kèm tham số (Ví dụ: `https://[PROJECT_REF].supabase.co/functions/v1/send-fcm?check=true`).
