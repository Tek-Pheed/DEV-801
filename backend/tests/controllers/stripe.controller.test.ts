jest.mock("../../src/utils/logger", () => ({
    __esModule: true,
    default: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
    },
}));

jest.mock("../../src/services/stripe.service", () => ({
    StripeService: jest.fn().mockImplementation(() => ({
        createPaymentLink: jest.fn(),
        getInvoices: jest.fn(),
    })),
}));

jest.mock("../../src/middlewares/auth.middleware", () => ({
    __esModule: true,
    default: (_req: any, _res: any, next: any) => next(),
}));

import express from "express";
import request from "supertest";
import stripeController from "../../src/controllers/stripe.controller";

describe("Stripe Controller - payment_callback", () => {
    const app = express();
    app.use(express.json());
    app.use("/", stripeController);

    describe("GET /payment_callback", () => {
        it("should return 200 with token and orderID when all query params are present", async () => {
            const response = await request(app)
                .get("/payment_callback/")
                .query({
                    token: "jwt-token",
                    orderID: "order-123",
                    status: "Validated",
                });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                token: "jwt-token",
                orderID: "order-123",
                status: "Validated",
            });
        });

        it("should return 400 when query params are missing", async () => {
            const response = await request(app)
                .get("/payment_callback/")
                .query({ token: "jwt-token" });

            expect(response.status).toBe(400);
            expect(response.body.msg).toBe("Invalid request");
        });

        it("should return 400 when no query params are provided", async () => {
            const response = await request(app).get("/payment_callback/");

            expect(response.status).toBe(400);
            expect(response.body.msg).toBe("Invalid request");
        });
    });
});
