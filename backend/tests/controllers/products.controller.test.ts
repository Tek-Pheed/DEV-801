jest.mock("../../src/utils/logger", () => ({
    __esModule: true,
    default: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
    },
}));

const mockGetProducts = jest.fn();
const mockGetProductByID = jest.fn();
const mockGetProductByCode = jest.fn();

jest.mock("../../src/services/products.service", () => {
    return {
        __esModule: true,
        default: jest.fn().mockImplementation(() => ({
            getProducts: mockGetProducts,
            getProductByID: mockGetProductByID,
            getProductByCode: mockGetProductByCode,
        })),
    };
});

jest.mock("../../src/schemas/products.schema", () => ({
    productModel: {},
    productSchema: {},
}));

jest.mock("../../src/middlewares/auth.middleware", () => ({
    __esModule: true,
    default: (req: any, _res: any, next: any) => {
        req.user = { id: "user-123", email: "test@test.com" };
        next();
    },
}));

import express from "express";
import request from "supertest";
import productsController from "../../src/controllers/products.controller";

describe("Products Controller", () => {
    const app = express();
    app.use(express.json());
    app.use("/", productsController);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("GET /", () => {
        it("should return 200 with list of products", async () => {
            const products = [
                { _id: "p1", product_name: "Pain" },
                { _id: "p2", product_name: "Baguette" },
            ];
            mockGetProducts.mockResolvedValue(products);

            const response = await request(app).get("/");

            expect(response.status).toBe(200);
            expect(response.body).toEqual(products);
        });

        it("should return 500 when service throws", async () => {
            mockGetProducts.mockRejectedValue(new Error("DB error"));

            const response = await request(app).get("/");

            expect(response.status).toBe(500);
            expect(response.body.msg).toBe("Internal Server Error");
        });
    });

    describe("GET /:productID", () => {
        it("should return 200 with product details", async () => {
            const product = [{ _id: "p1", product_name: "Pain" }];
            mockGetProductByID.mockResolvedValue(product);

            const response = await request(app).get("/product-id-123");

            expect(response.status).toBe(200);
            expect(response.body).toEqual(product);
        });

        it("should return 500 when service throws", async () => {
            mockGetProductByID.mockRejectedValue(new Error("Not found"));

            const response = await request(app).get("/product-id-123");

            expect(response.status).toBe(500);
            expect(response.body.msg).toBe("Internal Server Error");
        });
    });
});
