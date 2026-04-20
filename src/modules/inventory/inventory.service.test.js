const inventoryService = require("./inventory.service");
const prisma = require("../../config/prisma");

// Mock Prisma
jest.mock("../../config/prisma", () => ({
  $transaction: jest.fn(),
  inventory: {
    findMany: jest.fn(),
  },
}));

describe("Inventory Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getLowStock", () => {
    it("Nên trả về danh sách sản phẩm có tồn kho thấp hơn threshold", async () => {
      const mockLowStock = [
        { id: "inv-1", quantity: 5, product: { name: "Giày", sku: "G01" } },
      ];
      prisma.inventory.findMany.mockResolvedValue(mockLowStock);

      const threshold = 10;
      const result = await inventoryService.getLowStock(threshold);

      expect(result).toEqual(mockLowStock);
      expect(prisma.inventory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { quantity: { lte: threshold } },
        }),
      );
    });
  });

  describe("importStock", () => {
    it("Nên thực thi transaction thành công", async () => {
      // Giả lập callback của $transaction chạy thành công và trả về data
      const mockUpdatedInventory = { id: "inv-1", quantity: 50 };
      prisma.$transaction.mockImplementation(async (callback) => {
        // Trong môi trường mock thực tế, việc test sâu vào $transaction khá phức tạp,
        // ở mức Basic Unit Test, ta kiểm tra xem transaction có được gọi đúng không.
        return mockUpdatedInventory;
      });

      const data = {
        productId: "prod-1",
        quantity: 50,
        note: "Nhập lô hàng mới",
      };
      const userId = "user-admin";

      const result = await inventoryService.importStock(data, userId);

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result).toEqual(mockUpdatedInventory);
    });
  });
});
