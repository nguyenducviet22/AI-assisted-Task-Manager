# Hướng dẫn Chạy Dự án Task Manager (Full-stack)

Tài liệu này hướng dẫn chi tiết cách thiết lập môi trường, cơ sở dữ liệu, và chạy cả hai phần **Backend (Spring Boot)** và **Frontend (React)** của dự án. 

Dự án này áp dụng cho cả hai phiên bản trong thư mục làm việc của bạn:
* `ai-task-manager-fsdlc` (Phiên bản FSDLC)
* `ai-task-manager-sdlc` (Phiên bản SDLC)

---

## 🛠️ Yêu cầu Hệ thống (Prerequisites)

Trước khi bắt đầu, hãy đảm bảo máy tính của bạn đã cài đặt các công cụ sau:
1. **Java Development Kit (JDK) 21** trở lên.
2. **Apache Maven** (để quản lý thư viện và build Backend).
3. **Node.js** (Phiên bản LTS khuyên dùng, để chạy Frontend).
4. **PostgreSQL** (chạy trực tiếp trên máy hoặc thông qua **Docker Desktop**).

---

## 🗄️ Bước 1: Thiết lập Cơ sở dữ liệu (PostgreSQL)

Dự án được cấu hình để kết nối với cơ sở dữ liệu PostgreSQL cục bộ với các thông tin sau:
* **Host/Port**: `localhost:5432`
* **Username**: `postgres`
* **Password**: `postgres`
* **Database Name**: `tasks2db`

### Cách 1: Sử dụng Docker (Khuyên dùng)
Nếu bạn có một container Docker cho PostgreSQL đã tạo trước đó (tên là `postgres-container`), hãy khởi động Docker Desktop và chạy lệnh sau trong PowerShell/Command Prompt:
```powershell
docker start postgres-container
```

### Cách 2: Chạy trực tiếp PostgreSQL trên máy (Local Server)
1. Mở công cụ quản lý cơ sở dữ liệu của bạn (ví dụ: **pgAdmin**, **DBeaver**, hoặc thông qua terminal).
2. Tạo mới một database có tên là **`tasks2db`**:
   ```sql
   CREATE DATABASE tasks2db;
   ```
3. Đảm bảo user `postgres` có mật khẩu là `postgres`. Nếu thông tin mật khẩu của bạn khác, hãy cập nhật trong file cấu hình backend tại:
   `backend/src/main/resources/application.yml` (các dòng từ 4-5).

---

## ☕ Bước 2: Chạy ứng dụng Backend (Spring Boot)

Backend được xây dựng với Spring Boot 3 và Java 21.

1. Mở một terminal mới (PowerShell hoặc CMD) và chuyển vào thư mục `backend`:
   ```powershell
   cd backend
   ```
2. Build dự án và bỏ qua chạy unit tests (nếu cần thiết để khởi động nhanh):
   ```powershell
   mvn clean package -DskipTests
   ```
3. Khởi chạy ứng dụng Spring Boot:
   ```powershell
   mvn spring-boot:run
   ```
4. **Kiểm tra hoạt động:**
   * Backend sẽ chạy tại cổng mặc định: `http://localhost:8080`
   * Bạn có thể truy cập tài liệu API tự động (Swagger UI) để kiểm tra các endpoint tại:
     👉 [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

> [!NOTE]
> Trong phiên bản `ai-task-manager-sdlc`, cơ sở dữ liệu sẽ tự động được gieo mầm (seed) 3 người dùng thử nghiệm mặc định tại thời điểm ứng dụng khởi chạy (tạo sẵn thông qua lớp `DataSeeder`).

---

## 💻 Bước 3: Chạy ứng dụng Frontend (React + Vite)

Frontend sử dụng React, Vite, và TypeScript, được cấu hình để chạy trên cổng `3000`.

1. Mở một terminal **mới hoàn toàn** (không tắt terminal của backend) và chuyển vào thư mục `frontend`:
   ```powershell
   cd frontend
   ```
2. Cài đặt các thư viện phụ thuộc (chỉ cần thiết cho lần đầu chạy hoặc khi có thay đổi package):
   ```powershell
   npm install
   ```
3. Khởi chạy server phát triển (Development Server):
   ```powershell
   npm run dev
   ```
4. **Kiểm tra hoạt động:**
   * Trình duyệt sẽ mở hoặc bạn có thể truy cập trực tiếp tại:
     👉 [http://localhost:3000](http://localhost:3000)

---

## 🔍 Khắc phục Sự cố Thường gặp

| Lỗi / Hiện tượng | Nguyên nhân | Cách khắc phục |
| :--- | :--- | :--- |
| **`Connection refused` khi chạy Backend** | Database PostgreSQL chưa được bật hoặc thông tin kết nối sai. | Đảm bảo Docker PostgreSQL đã khởi chạy hoặc dịch vụ PostgreSQL local đang hoạt động trên cổng `5432`. |
| **Lỗi múi giờ PostgreSQL trên Windows** | Driver PostgreSQL xung đột múi giờ hệ thống (ví dụ: `Asia/Saigon`). | Backend đã được lập trình tự động đồng bộ múi giờ JVM về `UTC` khi khởi động nhằm tránh lỗi này. Đảm bảo chạy ứng dụng trực tiếp bằng file `TaskManagementApplication.java`. |
| **Không tìm thấy thư viện `node_modules` ở Frontend** | Chưa chạy cài đặt thư viện cho React. | Run `npm install` bên trong thư mục `frontend` trước khi chạy `npm run dev`. |
| **API gọi thất bại (Network Error)** | Backend chưa được bật hoặc không thể truy cập từ frontend. | Kiểm tra xem cổng `8080` của backend có đang phản hồi tại `http://localhost:8080/api-docs` không. |

Chúc bạn chạy ứng dụng thành công! Nếu gặp bất kỳ lỗi nào khác, hãy gửi mã lỗi để tôi hỗ trợ ngay lập tức.
