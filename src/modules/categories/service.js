<<<<<<< HEAD
const prisma = require('../../config/prisma');
=======
const prisma = require("../../config/prisma");
>>>>>>> 56942bc300cd9f14eafbd46f194b40d1720fcb84

class CategoryService {
  async getAll() {
    return await prisma.category.findMany({
<<<<<<< HEAD
      orderBy: { id: 'asc' },
      include: { _count: { select: { products: true } } } // Đếm số sản phẩm trong danh mục
=======
      orderBy: { id: "asc" },
      include: { _count: { select: { products: true } } }, // Đếm số sản phẩm trong danh mục
>>>>>>> 56942bc300cd9f14eafbd46f194b40d1720fcb84
    });
  }

  async create(data) {
    return await prisma.category.create({
      data: {
        name: data.name,
<<<<<<< HEAD
        description: data.description
      }
=======
        description: data.description,
      },
>>>>>>> 56942bc300cd9f14eafbd46f194b40d1720fcb84
    });
  }

  async update(id, data) {
    return await prisma.category.update({
      where: { id: parseInt(id) },
      data: {
        name: data.name,
<<<<<<< HEAD
        description: data.description
      }
=======
        description: data.description,
      },
>>>>>>> 56942bc300cd9f14eafbd46f194b40d1720fcb84
    });
  }

  async remove(id) {
    return await prisma.category.delete({
<<<<<<< HEAD
      where: { id: parseInt(id) }
=======
      where: { id: parseInt(id) },
>>>>>>> 56942bc300cd9f14eafbd46f194b40d1720fcb84
    });
  }
}

<<<<<<< HEAD
module.exports = new CategoryService();
=======
module.exports = new CategoryService();
>>>>>>> 56942bc300cd9f14eafbd46f194b40d1720fcb84
