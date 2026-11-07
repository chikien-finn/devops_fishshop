# AquaCraft - E-Commerce Platform

Dự án website thương mại điện tử chuyên cung cấp cá cảnh, thủy sinh và phụ kiện hồ cá cao cấp (**AquaCraft**), xây dựng bằng **React (Frontend)** và **Node.js/Express + MongoDB (Backend)** theo kiến trúc **Feature-Driven Architecture (Hướng tính năng)**.

---

## 1. Cấu trúc dự án (Directory Tree)

```text
AquaCraft/
│
├── frontend/                     # Giao diện người dùng (React 19 + Vite)
│   ├── public/                   # Tài nguyên tĩnh công khai (favicon, svg, ...)
│   ├── src/
│   │   ├── app/                  # Khởi tạo ứng dụng & cấu hình tổng thể
│   │   │   ├── App.jsx           # Root Component
│   │   │   ├── router.jsx        # Tuyến đường điều hướng (React Router)
│   │   │   └── providers.jsx     # Bọc các Providers (Auth, Theme, State)
│   │   ├── assets/               # Hình ảnh, biểu tượng, styles tĩnh
│   │   │   ├── icons/
│   │   │   ├── images/
│   │   │   └── styles/
│   │   ├── components/           # UI Components tái sử dụng
│   │   │   ├── common/           # Button, Modal, Input, Pagination...
│   │   │   └── layout/           # MainLayout (Khách hàng), AdminLayout (Quản trị)
│   │   ├── features/             # Module tính năng nghiệp vụ (Feature-based)
│   │   │   ├── auth/             # Đăng ký, đăng nhập, bảo mật
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   ├── pages/        # LoginPage.jsx...
│   │   │   │   └── services/
│   │   │   ├── products/         # Quản lý cá cảnh, bộ lọc, chi tiết sản phẩm
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   ├── pages/        # ProductListPage.jsx...
│   │   │   │   └── services/
│   │   │   ├── cart/             # Giỏ hàng
│   │   │   ├── orders/           # Thanh toán & đơn hàng
│   │   │   ├── reviews/          # Đánh giá, bình luận
│   │   │   └── users/            # Hồ sơ người dùng
│   │   ├── services/             # Cấu hình API client chung (Axios instance)
│   │   │   └── api.js
│   │   ├── utils/                # Hàm tiện ích chung (format tiền tệ, ngày tháng...)
│   │   │   └── formatters.js
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── backend/                      # RESTful API (Express + MongoDB)
│   ├── src/
│   │   ├── server.js             # Khởi động server HTTP & kết nối cơ sở dữ liệu
│   │   ├── app.js                # Cấu hình Express app, middleware & gắn routes
│   │   ├── configs/              # Cấu hình môi trường & MongoDB
│   │   │   ├── db.config.js
│   │   │   └── env.config.js
│   │   ├── middlewares/          # Middleware hệ thống
│   │   │   ├── auth.middleware.js       # Xác thực JWT & phân quyền Admin
│   │   │   ├── error.middleware.js      # Bắt lỗi tập trung (Error Handler)
│   │   │   └── upload.middleware.js     # Upload file/ảnh (Multer)
│   │   ├── features/             # Vertical Slices theo từng nghiệp vụ
│   │   │   ├── auth/             # auth.controller, auth.service, auth.routes
│   │   │   ├── users/            # user.model, user.controller, user.service, user.routes
│   │   │   ├── products/         # product.model, product.controller, product.service, product.routes
│   │   │   ├── cart/             # cart.model, cart.controller, cart.service, cart.routes
│   │   │   ├── orders/           # order.model, order.controller, order.service, order.routes
│   │   │   └── reviews/          # review.model, review.controller, review.service, review.routes
│   │   └── utils/                # Lớp lỗi chuẩn & hàm phản hồi
│   │       ├── apiError.js
│   │       └── responseHandler.js
│   ├── .env.example
│   └── package.json
│
├── package.json                  # Root Monorepo Scripts
└── README.md
```

---

## 2. Hướng dẫn cài đặt & Khởi chạy

### Bước 1: Cài đặt dependencies
Chạy từ thư mục gốc `AquaCraft`:
```bash
npm --prefix backend install
npm --prefix frontend install
```

### Bước 2: Cấu hình biến môi trường (`.env`)
Chỉ cần chạy lệnh sau ngay trong terminal ở thư mục gốc `AquaCraft` để tự động tạo file `backend/.env`:
```bash
npm run setup:env
```

*(Hoặc chạy lệnh copy tương ứng theo hệ điều hành/terminal bạn đang dùng):*
- **PowerShell (mặc định Windows / VS Code):**
  ```powershell
  Copy-Item backend/.env.example backend/.env
  ```
- **Command Prompt (CMD):**
  ```cmd
  copy backend\.env.example backend\.env
  ```
- **Git Bash / macOS / Linux:**
  ```bash
  cp backend/.env.example backend/.env
  ```

> [!IMPORTANT]
> **Nội dung file `backend/.env`:**
> ```env
> PORT=5000
> NODE_ENV=development
> MONGO_URI=mongodb+srv://anhtxsc000:team1234@cluster0.ree787p.mongodb.net/aquacraft?retryWrites=true&w=majority
> JWT_SECRET=aquacraft_super_secret_jwt_key_2026
> JWT_EXPIRES_IN=7d
> CLIENT_URL=http://localhost:5173
> ```

### Bước 3: Khởi chạy dự án
Chạy đồng thời hoặc từng phần từ thư mục gốc `AquaCraft`:
```bash
# Chạy Backend API (http://localhost:5000)
npm run server

# Chạy Frontend UI (http://localhost:5173)
npm run client
```

---

## 3. Ghi chú quan trọng về Database & Tài khoản mẫu

> [!WARNING]
> **KHÔNG chạy lại lệnh `npm run seed:backend`**:
> - Database hiện tại đang lưu trữ trực tiếp trên **MongoDB Atlas Cloud dùng chung**.
> - Dữ liệu đã được nạp sẵn. Nếu chạy lại script seed, database sẽ bị xóa toàn bộ (`deleteMany`) để nạp lại từ đầu!

### Tài khoản mẫu đã seed sẵn trong DB:
| Vai trò | Email | Mật khẩu |
| :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin@aquacraft.com` | `admin123` |
| **Khách hàng (User)** | `khachhang@gmail.com` | `user123` |
