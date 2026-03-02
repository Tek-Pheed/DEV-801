jest.mock("../../src/utils/logger", () => ({
    __esModule: true,
    default: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
    },
}));

const mockGetOrders = jest.fn();
const mockUpdateStatusOrder = jest.fn();

jest.mock("../../src/services/order.service", () => {
    return {
        __esModule: true,
        default: jest.fn().mockImplementation(() => ({
            getOrders: mockGetOrders,
            updateStatusOrder: mockUpdateStatusOrder,
        })),
    };
});

jest.mock("../../src/schemas/order.schema", () => ({
    __esModule: true,
    default: {},
    orderStatus: {
        pending: "Pending",
        validated: "Validated",
        canceled: "Canceled",
    },
}));

jest.mock("../../src/schemas/products.schema", () => ({
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
import orderController from "../../src/controllers/order.controller";

describe("Order Controller", () => {
    const app = express();
    app.use(express.json());
    app.use("/", orderController);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("GET /", () => {
        it("should return 200 with orders", async () => {
            const orders = [
                { _id: "o1", status: "Pending" },
                { _id: "o2", status: "Validated" },
            ];
            mockGetOrders.mockResolvedValue(orders);

            const response = await request(app).get("/");

            expect(response.status).toBe(200);
            expect(response.body).toEqual(orders);
        });

        it("should return 400 when no orders found", async () => {
            mockGetOrders.mockResolvedValue(null);

            const response = await request(app).get("/");

            expect(response.status).toBe(400);
            expect(response.body.msg).toBe("No orders found !");
        });
    });

    describe("POST /validate", () => {
        it("should return 200 when order is updated", async () => {
            mockUpdateStatusOrder.mockResolvedValue(true);

            const response = await request(app).post("/validate").send({
                status: "Validated",
                orderID: "order-123",
            });

            expect(response.status).toBe(200);
            expect(response.body.msg).toBe("Order updated");
        });

        it("should return 400 when status or orderID is missing", async () => {
            const response = await request(app).post("/validate").send({
                status: "Validated",
            });

            expect(response.status).toBe(400);
            expect(response.body.msg).toBe("Invalid request");
        });

        it("should return 400 when update fails", async () => {
            mockUpdateStatusOrder.mockResolvedValue(false);

            const response = await request(app).post("/validate").send({
                status: "Validated",
                orderID: "order-123",
            });

            expect(response.status).toBe(400);
            expect(response.body.msg).toBe("Invalid request");
        });
    });
});
