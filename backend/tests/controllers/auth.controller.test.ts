jest.mock("../../src/utils/logger", () => ({
    __esModule: true,
    default: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
    },
}));

const mockCreateUser = jest.fn();
const mockLogin = jest.fn();

jest.mock("../../src/services/auth.service", () => ({
    AuthService: jest.fn().mockImplementation(() => ({
        createUser: mockCreateUser,
        login: mockLogin,
    })),
}));

const mockGenerateToken = jest.fn();
jest.mock("../../src/utils/jwt", () => ({
    generateToken: (...args: any[]) => mockGenerateToken(...args),
}));

import express from "express";
import request from "supertest";
import { authController } from "../../src/controllers/auth.controller";

describe("Auth Controller", () => {
    const app = express();
    app.use(express.json());
    app.use("/", authController);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("POST /register", () => {
        it("should return 201 when user is created successfully", async () => {
            mockCreateUser.mockResolvedValue(true);

            const response = await request(app).post("/register").send({
                firstName: "John",
                lastName: "Doe",
                email: "john@test.com",
                password: "password123",
            });

            expect(response.status).toBe(201);
            expect(response.body.message).toBe("User created successfully.");
        });

        it("should return 400 when required fields are missing", async () => {
            const response = await request(app).post("/register").send({
                email: "john@test.com",
            });

            expect(response.status).toBe(400);
            expect(response.body.msg).toBe("Invalid request");
        });

        it("should return 500 when user creation fails", async () => {
            mockCreateUser.mockResolvedValue(false);

            const response = await request(app).post("/register").send({
                firstName: "John",
                lastName: "Doe",
                email: "john@test.com",
                password: "password123",
            });

            expect(response.status).toBe(500);
            expect(response.body.message).toBe("Internal Server Error");
        });
    });

    describe("POST /login", () => {
        it("should return 201 with token on successful login", async () => {
            mockLogin.mockResolvedValue({
                _id: { toString: () => "user-id-123" },
                email: "john@test.com",
            });
            mockGenerateToken.mockResolvedValue("jwt-token-here");

            const response = await request(app).post("/login").send({
                email: "john@test.com",
                password: "password123",
            });

            expect(response.status).toBe(201);
            expect(response.body.token).toBe("jwt-token-here");
        });

        it("should return 400 when email or password is missing", async () => {
            const response = await request(app).post("/login").send({
                email: "john@test.com",
            });

            expect(response.status).toBe(400);
            expect(response.body.msg).toBe("Invalid request");
        });

        it("should return 500 when login fails", async () => {
            mockLogin.mockResolvedValue(null);

            const response = await request(app).post("/login").send({
                email: "john@test.com",
                password: "wrongpassword",
            });

            expect(response.status).toBe(500);
            expect(response.body.message).toBe("No account found");
        });
    });
});
