// src/app.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const hpp = require("hpp");
const xssClean = require("xss-clean");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const fs = require("fs");
const path = require("path");

const errorHandler = require("./middleware/error.middleware");

// Routes
const authRoutes = require("./modules/auth/auth.routes");
const userRoutes = require("./modules/users/user.routes");
const productRoutes = require("./modules/products/product.routes");
const orderRoutes = require("./modules/orders/order.routes");
const dashboardRoutes = require("./modules/dashboard/dashboard.routes");
const customerRoutes = require("./modules/customers/customer.routes");
const inventoryRoutes = require("./modules/inventory/inventory.routes");
const categoryRoutes = require("./modules/categories/category.routes");
const reportRoutes = require("./modules/reports/report.routes");
const auditRoutes = require("./modules/audit/audit.routes");

const app = express();
const corsOrigin =
  process.env.CORS_ORIGIN || process.env.CLIENT_URL || "http://localhost:5173";

// ==================== Middleware ====================
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(xssClean());
app.use(hpp());
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ==================== Routes ====================
app.get("/", (req, res) => {
  res.json({ message: "🚀 ERP System API đang chạy!", version: "1.0.0" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/audit", auditRoutes);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} không tồn tại`,
  });
});

// Error handler (phải đặt cuối cùng)
app.use(errorHandler);

// ==================== Start Server ====================
// Khởi động server có xử lý lỗi EADDRINUSE: nếu cổng bị chiếm sẽ thử cổng tiếp theo
const DEFAULT_PORT = Number(process.env.PORT) || 4000; // fallback

// Ghi `VITE_API_URL` vào frontend/.env để frontend dev server biết backend đang chạy ở cổng nào.
const updateFrontendEnv = (port) => {
  try {
    const frontendEnvPath = path.join(__dirname, "..", "frontend", ".env");
    const line = `VITE_API_URL=http://localhost:${port}/api`;

    let content = "";
    if (fs.existsSync(frontendEnvPath)) {
      content = fs.readFileSync(frontendEnvPath, "utf8");
      if (/^VITE_API_URL=.*$/m.test(content)) {
        content = content.replace(/^VITE_API_URL=.*$/m, line);
      } else {
        if (content.length && !content.endsWith("\n")) content += "\n";
        content += line + "\n";
      }
    } else {
      // tạo file nếu chưa có
      content = line + "\n";
    }

    fs.writeFileSync(frontendEnvPath, content, "utf8");
    console.log(`Updated frontend .env -> ${line}`);
  } catch (e) {
    console.warn("Unable to update frontend .env:", e.message);
  }
};

const startServer = (port, retries = 10) => {
  const p = Number(port);
  const server = app.listen(p, () => {
    console.log(`\n🚀 ERP Server đang chạy tại: http://localhost:${p}`);
    console.log(`📚 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log("\n📋 API Endpoints:");
    console.log(`  POST   /api/auth/login`);
    console.log(`  GET    /api/auth/me`);
    console.log(`  GET    /api/products`);
    console.log(`  POST   /api/orders`);
    console.log(`  GET    /api/dashboard/overview`);
    console.log(`  POST   /api/inventory/import`);
    console.log(`  GET    /api/inventory/transactions`);
    console.log(`  GET    /api/customers`);
    console.log(`  GET    /api-docs`);
    // Cập nhật frontend/.env để frontend dev biết API URL (chỉ cho môi trường dev)
    try {
      updateFrontendEnv(p);
    } catch (e) {
      // không block server nếu không thể ghi file
    }
  });

  server.on("error", (err) => {
    if (err && err.code === "EADDRINUSE") {
      console.warn(`Port ${p} is already in use.`);
      if (retries > 0) {
        console.log(`Trying port ${p + 1}... (${retries - 1} retries left)`);
        startServer(p + 1, retries - 1);
      } else {
        console.error(
          "No available ports found. Please free the port or set PORT in .env.",
        );
        process.exit(1);
      }
    } else {
      console.error("Server error:", err);
      process.exit(1);
    }
  });
};

startServer(DEFAULT_PORT);

module.exports = app;
