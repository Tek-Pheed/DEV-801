jest.mock("../../src/utils/logger", () => ({
    __esModule: true,
    default: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
    },
}));

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

jest.mock("../../src/services/paypal.service", () => ({
    PaypalService: jest.fn().mockImplementation(() => ({
        createPaymentLink: jest.fn(),
    })),
}));

jest.mock("../../src/middlewares/auth.middleware", () => ({
    __esModule: true,
    default: (_req: any, _res: any, next: any) => next(),
}));

import express from "express";
import request from "supertest";
import paypalController from "../../src/controllers/paypal.controller";

describe("Paypal Controller - payment_callback", () => {
    const app = express();
    app.use(express.json());
    app.use("/", paypalController);

    describe("GET /payment_callback", () => {
        it("should return 200 with token and orderID when all query params are present", async () => {
            const response = await request(app)
                .get("/payment_callback/")
                .query({
                    token: "jwt-token",
                    orderID: "order-456",
                    status: "Validated",
                });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                token: "jwt-token",
                orderID: "order-456",
                status: "Validated",
            });
        });

        it("should return 400 when query params are missing", async () => {
            const response = await request(app)
                .get("/payment_callback/")
                .query({ orderID: "order-456" });

            expect(response.status).toBe(400);
            expect(response.body.msg).toBe("Invalid request");
        });

        it("should return 400 when no query params at all", async () => {
            const response = await request(app).get("/payment_callback/");

            expect(response.status).toBe(400);
            expect(response.body.msg).toBe("Invalid request");
        });
    });
});
