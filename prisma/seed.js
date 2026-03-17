// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Tạo Admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@erp.com' },
    update: {},
    create: {
      email: 'admin@erp.com',
      password: hashedPassword,
      fullName: 'Administrator',
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Tạo categories mẫu
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Điện tử' },
      update: {},
      create: { name: 'Điện tử', description: 'Thiết bị điện tử' },
    }),
    prisma.category.upsert({
      where: { name: 'Thời trang' },
      update: {},
      create: { name: 'Thời trang', description: 'Quần áo, phụ kiện' },
    }),
    prisma.category.upsert({
      where: { name: 'Thực phẩm' },
      update: {},
      create: { name: 'Thực phẩm', description: 'Hàng thực phẩm' },
    }),
  ]);
  console.log('✅ Categories created:', categories.length);

  // Tạo sản phẩm mẫu
  const product = await prisma.product.upsert({
    where: { sku: 'SP001' },
    update: {},
    create: {
      sku: 'SP001',
      name: 'Sản phẩm mẫu',
      price: 150000,
      costPrice: 100000,
      categoryId: categories[0].id,
      inventory: {
        create: { quantity: 100, minStock: 10 },
      },
    },
  });
  console.log('✅ Sample product created:', product.name);

  console.log('\n🎉 Seed completed!');
  console.log('📧 Login: admin@erp.com');
  console.log('🔑 Password: admin123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
