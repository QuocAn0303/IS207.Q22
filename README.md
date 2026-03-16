# 🏪 ERP System - Bán Lẻ

Backend API cho hệ thống ERP bán lẻ, xây dựng với Node.js + Express + PostgreSQL + Prisma.

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Auth**: JWT + bcrypt
- **Validation**: Zod

## 📁 Cấu trúc Project

```
src/
├── modules/
│   ├── auth/          # Đăng nhập, profile, đổi mật khẩu
│   ├── users/         # Quản lý nhân viên
│   ├── products/      # Quản lý sản phẩm
│   ├── orders/        # Quản lý đơn hàng
│   └── dashboard/     # Báo cáo, thống kê
|   |__export/         #xuất pdf, excel?
|
├── middleware/
│   ├── auth.middleware.js   # Xác thực JWT + phân quyền
│   └── error.middleware.js  # Xử lý lỗi tập trung
├── utils/
│   └── response.js    # Helper format response
├── config/
│   └── prisma.js      # Prisma client
└── app.js             # Entry point
```

## 🚀 Cài đặt và chạy

### 1. Cài đặt PostgreSQL

```bash
# Với Docker (khuyến nghị)
docker run --name erp-postgres \
  -e POSTGRES_PASSWORD=yourpassword \
  -e POSTGRES_DB=erp_db \
  -p 5432:5432 \
  -d postgres:15
```

### 2. Clone và cài dependencies

```bash
cd erp-system
npm install
```

### 3. Cấu hình môi trường

```bash
cp .env.example .env
# Mở .env và sửa DATABASE_URL, JWT_SECRET
```

### 4. Khởi tạo database

```bash
npx prisma migrate dev --name init
npm run db:seed
```

### 5. Chạy server

```bash
npm run dev
```

Server chạy tại: `http://localhost:3000`

## 📋 API Endpoints

### Auth

| Method | Endpoint                  | Mô tả         | Auth |
| ------ | ------------------------- | ------------- | ---- |
| POST   | /api/auth/login           | Đăng nhập     | ❌   |
| GET    | /api/auth/me              | Thông tin tôi | ✅   |
| PUT    | /api/auth/change-password | Đổi mật khẩu  | ✅   |

### Users (ADMIN only)

| Method | Endpoint                           | Mô tả         |
| ------ | ---------------------------------- | ------------- |
| GET    | /api/users?page=1&limit=10&search= | Danh sách     |
| POST   | /api/users                         | Tạo tài khoản |
| PUT    | /api/users/:id                     | Cập nhật      |
| DELETE | /api/users/:id                     | Vô hiệu hóa   |

### Products

| Method | Endpoint                          | Mô tả                        |
| ------ | --------------------------------- | ---------------------------- |
| GET    | /api/products?search=&categoryId= | Danh sách                    |
| GET    | /api/products/:id                 | Chi tiết                     |
| POST   | /api/products                     | Tạo sản phẩm (ADMIN/MANAGER) |
| PUT    | /api/products/:id                 | Cập nhật (ADMIN/MANAGER)     |
| DELETE | /api/products/:id                 | Xóa (ADMIN)                  |

### Orders

| Method | Endpoint                  | Mô tả               |
| ------ | ------------------------- | ------------------- |
| GET    | /api/orders?status=&page= | Danh sách           |
| GET    | /api/orders/:id           | Chi tiết            |
| POST   | /api/orders               | Tạo đơn hàng        |
| PATCH  | /api/orders/:id/status    | Cập nhật trạng thái |

### Dashboard

| Method | Endpoint                | Mô tả            |
| ------ | ----------------------- | ---------------- |
| GET    | /api/dashboard/overview | Tổng quan        |
| GET    | /api/dashboard/revenue  | Doanh thu 7 ngày |

## 🔐 Phân quyền

| Role      | Quyền                            |
| --------- | -------------------------------- |
| ADMIN     | Toàn quyền                       |
| MANAGER   | Xem + tạo/sửa sản phẩm, đơn hàng |
| CASHIER   | Xem + tạo đơn hàng               |
| WAREHOUSE | Xem sản phẩm, kho                |

## 💡 Test nhanh với curl

```bash
# 1. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@erp.com","password":"admin123"}'

# 2. Lấy token từ response, rồi test API:
TOKEN="your_token_here"

# 3. Lấy danh sách sản phẩm
curl http://localhost:3000/api/products \
  -H "Authorization: Bearer $TOKEN"
```

## 🗺️ Roadmap tiếp theo

- [ ] Module Khách hàng (CRM)
- [ ] Module Kho (nhập hàng, kiểm kho)
- [ ] Module Danh mục
- [ ] Báo cáo nâng cao (PDF export)
- [ ] Frontend React + Ant Design
- [ ] Unit tests
