jest.mock("../../src/utils/logger", () => ({
    __esModule: true,
    default: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
    },
}));

const mockFind = jest.fn();
const mockFindOne = jest.fn();

jest.mock("../../src/schemas/products.schema", () => ({
    productModel: {
        find: mockFind,
        findOne: mockFindOne,
    },
    productSchema: {},
}));

import ProductsService from "../../src/services/products.service";

describe("ProductsService", () => {
    let service: ProductsService;

    beforeEach(() => {
        service = new ProductsService();
        jest.clearAllMocks();
    });

    describe("getProducts", () => {
        it("should return all products", async () => {
            const mockProducts = [
                { _id: "1", product_name: "Pain", price: 100 },
                { _id: "2", product_name: "Baguette", price: 120 },
            ];
            mockFind.mockResolvedValue(mockProducts);

            const result = await service.getProducts();

            expect(result).toEqual(mockProducts);
            expect(mockFind).toHaveBeenCalledWith({});
        });

        it("should throw an error if find fails", async () => {
            mockFind.mockRejectedValue(new Error("DB connection error"));

            await expect(service.getProducts()).rejects.toThrow(
                "Erreur lors de la récupération des produits",
            );
        });
    });

    describe("getProductByID", () => {
        it("should return a product by ID", async () => {
            const mockProduct = [
                { _id: "abc123", product_name: "Croissant" },
            ];
            mockFind.mockResolvedValue(mockProduct);

            const result = await service.getProductByID("abc123");

            expect(result).toEqual(mockProduct);
            expect(mockFind).toHaveBeenCalledWith({ _id: "abc123" });
        });

        it("should throw an error if find fails", async () => {
            mockFind.mockRejectedValue(new Error("Not found"));

            await expect(service.getProductByID("invalid")).rejects.toThrow(
                "Erreur lors de la récupération des produits",
            );
        });
    });

    describe("getProductByCode", () => {
        it("should return a product by code", async () => {
            const mockProduct = {
                code: "3017620422003",
                product_name: "Nutella",
            };
            mockFindOne.mockResolvedValue(mockProduct);

            const result = await service.getProductByCode("3017620422003");

            expect(result).toEqual(mockProduct);
            expect(mockFindOne).toHaveBeenCalledWith({
                code: "3017620422003",
            });
        });

        it("should return null if product not found", async () => {
            mockFindOne.mockResolvedValue(null);

            const result = await service.getProductByCode("0000000000000");

            expect(result).toBeNull();
        });

        it("should throw an error if findOne fails", async () => {
            mockFindOne.mockRejectedValue(new Error("DB error"));

            await expect(
                service.getProductByCode("invalid"),
            ).rejects.toThrow(
                "Erreur lors de la récupération du produit par code",
            );
        });
    });
});
