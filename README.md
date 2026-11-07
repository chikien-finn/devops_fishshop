# AquaCraft - E-Commerce Platform

Dự án website thương mại điện tử chuyên cung cấp cá cảnh, thủy sinh và phụ kiện hồ cá cao cấp (**AquaCraft**), xây dựng bằng **React (Frontend)** và **Node.js/Express + MongoDB (Backend)** theo kiến trúc **Feature-Driven Architecture (Hướng tính năng)**.

---

## 🚀 Thông tin Triển khai Thực tế (Production Deployment)

Hệ thống đã được thiết lập quy trình tự động hóa **CI/CD hoàn chỉnh bằng GitHub Actions** và triển khai trực tiếp trên cụm máy chủ **AWS EC2**:

- 🌐 **Website Live (Frontend):** [http://3.27.62.149](http://3.27.62.149)
- 🔌 **API Health Check (Backend):** [http://3.27.62.149/api/health](http://3.27.62.149/api/health)
- 🐳 **Docker Hub Registry:**
  - Frontend Image: `kienn11/aquacraft-frontend:latest`
  - Backend Image: `kienn11/aquacraft-backend:latest`
- ⚙️ **GitHub Actions Pipeline:** [Xem lịch sử CI/CD](https://github.com/chikien-finn/devops_fishshop/actions)

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
Chạy cả hai hoặc từng phần từ thư mục gốc `AquaCraft`:
```bash
# Chạy cả Backend & Frontend cùng lúc (Khuyên dùng)
npm run dev

# Hoặc chạy từng phần riêng biệt trong 2 terminal:
# 1. Backend API (http://localhost:5000)
npm run server

# 2. Frontend UI (http://localhost:5173)
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

---

## 4. Hướng dẫn Phát triển & Quy trình làm việc cho các Thành viên

### ❓ Về Cơ sở dữ liệu (Database) khi code: Có cần kết nối gì không?
- **KHÔNG CẦN CÀI ĐẶT MONGODB TRÊN MÁY**: Cả nhóm sử dụng chung cơ sở dữ liệu **MongoDB Atlas Cloud**.
- Khi một thành viên mới clone dự án về, chỉ cần chạy đúng 1 lệnh:
  ```bash
  npm run setup:env
  ```
  File `backend/.env` sẽ tự động cấu hình chuỗi kết nối Cloud dùng chung. Mọi dữ liệu (tài khoản đăng ký, cá mới thêm, giỏ hàng, đơn hàng) được tự động đồng bộ ngay lập tức cho toàn bộ các thành viên.
- **TUYỆT ĐỐI KHÔNG CHẠY `npm run seed:backend`** vì lệnh này sẽ xóa sạch dữ liệu chung của cả nhóm!

---

### 🔄 Quy trình Code, Kiểm thử & Đồng bộ lên Production (Git & CI/CD Workflow)

Để hệ thống không bị lỗi và tự động triển khai mượt mà lên AWS, mỗi thành viên tuân thủ các bước sau:

#### Bước 1: Kéo code mới nhất từ nhánh `main`
```bash
git checkout main
git pull origin main
```

#### Bước 2: Tạo nhánh tính năng riêng theo phân công
Mỗi thành viên làm việc độc lập trên nhánh của mình:
- **Thành viên 1:** `git checkout -b feature/auth-users`
- **Thành viên 2:** `git checkout -b feature/products-catalog`
- **Thành viên 3:** `git checkout -b feature/cart-orders`
- **Thành viên 4:** `git checkout -b feature/reviews-dashboard`

#### Bước 3: Khởi chạy và code tại máy cá nhân
Chạy đồng thời cả Frontend và Backend:
```bash
npm run dev
```

#### Bước 4: Tự kiểm tra lỗi trước khi Push (Bắt buộc)
Trước khi commit & push, hãy chạy 3 lệnh sau để đảm bảo không làm fail pipeline CI:
```bash
# 1. Kiểm tra cú pháp mã nguồn
npm run lint

# 2. Chạy Unit Test tự động
npm test

# 3. Thử nghiệm build Frontend Vite
npm run build:frontend
```

#### Bước 5: Đẩy nhánh lên GitHub & Mở Pull Request (PR)
```bash
git add .
git commit -m "feat(<module>): mô tả tính năng vừa làm"
git push origin <tên-nhánh-của-bạn>
```
Vào GitHub tạo **Pull Request** từ nhánh của bạn vào nhánh `main`.

#### Bước 6: Tự động hóa CI/CD
- **Ngay khi mở PR:** Hệ thống GitHub Actions sẽ tự động kích hoạt **Stage 1: CI (Lint, Test, Build)**. Nếu báo xanh (Pass), code của bạn đạt chuẩn.
- **Khi PR được Merge vào `main`:** Hệ thống tự động kích hoạt **Stage 2 (Docker Build & Push)** và **Stage 3 (CD)**: Máy chủ AWS EC2 sẽ tự động kéo phiên bản mới nhất về và cập nhật trang web [http://3.27.62.149](http://3.27.62.149) trong vòng ~1 phút mà không cần bất kỳ ai phải đăng nhập vào AWS!
