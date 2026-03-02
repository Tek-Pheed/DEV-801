jest.mock("../../src/utils/logger", () => ({
    __esModule: true,
    default: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
    },
}));

const mockGetHistory = jest.fn();

jest.mock("../../src/services/history.service", () => {
    return {
        __esModule: true,
        default: jest.fn().mockImplementation(() => ({
            getHistory: mockGetHistory,
        })),
    };
});

jest.mock("../../src/schemas/history.schema", () => ({
    __esModule: true,
    default: {},
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
import historyController from "../../src/controllers/history.controller";

describe("History Controller", () => {
    const app = express();
    app.use(express.json());
    app.use("/", historyController);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("GET /", () => {
        it("should return 200 with history", async () => {
            const history = [
                { orderID: "o1", userID: "user-123" },
                { orderID: "o2", userID: "user-123" },
            ];
            mockGetHistory.mockResolvedValue(history);

            const response = await request(app).get("/");

            expect(response.status).toBe(200);
            expect(response.body).toEqual(history);
        });

        it("should return 400 when history is null", async () => {
            mockGetHistory.mockResolvedValue(null);

            const response = await request(app).get("/");

            expect(response.status).toBe(400);
            expect(response.body.msg).toBe("bad request");
        });

        it("should return 500 when service throws", async () => {
            mockGetHistory.mockRejectedValue(new Error("DB error"));

            const response = await request(app).get("/");

            expect(response.status).toBe(500);
            expect(response.body.msg).toBe("Internal Server Error");
        });
    });
});
