const productService = require("./product.service");
const prisma = require("../../config/prisma");

// Mock toàn bộ Prisma module
jest.mock("../../config/prisma", () => ({
  product: {
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
  },
}));

describe("Product Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAll", () => {
    it("Nên trả về danh sách sản phẩm và phân trang hợp lệ", async () => {
      const mockProducts = [{ id: "1", name: "Vợt cầu lông" }];
      prisma.product.findMany.mockResolvedValue(mockProducts);
      prisma.product.count.mockResolvedValue(1);

      const result = await productService.getAll({ page: 1, limit: 10 });

      expect(result.products).toEqual(mockProducts);
      expect(result.pagination.total).toBe(1);
      expect(prisma.product.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe("create", () => {
    it("Nên tạo sản phẩm và khởi tạo kho bằng 0", async () => {
      const inputData = {
        name: "Vợt Yonex",
        sku: "YNX01",
        price: 2000000,
        costPrice: 1500000,
        categoryId: "cat-1",
      };
      const expectedOutput = { id: "new-id", ...inputData };

      prisma.product.create.mockResolvedValue(expectedOutput);

      const result = await productService.create(inputData);

      expect(result).toEqual(expectedOutput);
      expect(prisma.product.create).toHaveBeenCalledWith({
        data: {
          ...inputData,
          inventory: { create: { quantity: 0 } },
        },
      });
    });
  });
});
