// src/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const errorHandler = require('./middleware/error.middleware');

// Routes
const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/users/user.routes');
const productRoutes = require('./modules/products/product.routes');
const orderRoutes = require('./modules/orders/order.routes');
const dashboardRoutes = require('./modules/dashboard/dashboard.routes');
const customerRoutes = require('./modules/customers/customer.routes');
const inventoryRoutes = require('./modules/inventory/inventory.routes');
const categoryRoutes = require('./modules/categories/category.routes');

const app = express();

// ==================== Middleware ====================
app.use(cors({
  origin: 'http://localhost:5173', // Chỉ cho phép Frontend ở port này truy cập
  credentials: true // Cho phép gửi kèm token/cookie
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== Routes ====================
app.get('/', (req, res) => {
  res.json({ message: '🚀 ERP System API đang chạy!', version: '1.0.0' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/categories', categoryRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} không tồn tại` });
});

// Error handler (phải đặt cuối cùng)
app.use(errorHandler);

// ==================== Start Server ====================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 ERP Server đang chạy tại: http://localhost:${PORT}`);
  console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('\n📋 API Endpoints:');
  console.log(`  POST   /api/auth/login`);
  console.log(`  GET    /api/auth/me`);
  console.log(`  GET    /api/products`);
  console.log(`  POST   /api/orders`);
  console.log(`  GET    /api/dashboard/overview`);
  console.log(`  POST   /api/inventory/import`);
  console.log(`  GET    /api/inventory/transactions`);
  console.log(`  GET    /api/customers`);
});

module.exports = app;
