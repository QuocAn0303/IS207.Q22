const prisma = require("../../config/prisma");

class CategoryService {
  async getAll() {
    return await prisma.category.findMany({
      orderBy: { id: "asc" },
      include: { _count: { select: { products: true } } }, // Đếm số sản phẩm trong danh mục
    });
  }

  async create(data) {
    return await prisma.category.create({
      data: {
        name: data.name,
        description: data.description,
      },
    });
  }

  async update(id, data) {
    return await prisma.category.update({
      where: { id: parseInt(id) },
      data: {
        name: data.name,
        description: data.description,
      },
    });
  }

  async remove(id) {
    return await prisma.category.delete({
      where: { id: parseInt(id) },
    });
  }
}

module.exports = new CategoryService();
