jest.mock("../../src/utils/logger", () => ({
    __esModule: true,
    default: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
    },
}));

const mockSave = jest.fn();
const mockFind = jest.fn();

jest.mock("../../src/schemas/users.schema", () => {
    const MockModel = jest.fn().mockImplementation(() => ({
        save: mockSave,
    }));
    (MockModel as any).find = mockFind;
    return { __esModule: true, default: MockModel };
});

jest.mock("bcryptjs", () => ({
    hashSync: jest.fn((password: string) => `hashed_${password}`),
    compareSync: jest.fn(
        (password: string, hash: string) => hash === `hashed_${password}`,
    ),
}));

import { AuthService } from "../../src/services/auth.service";

describe("AuthService", () => {
    let service: AuthService;

    beforeEach(() => {
        service = new AuthService();
        jest.clearAllMocks();
    });

    describe("createUser", () => {
        it("should create a user and return true on success", async () => {
            mockSave.mockResolvedValue(true);

            const result = await service.createUser(
                "test@example.com",
                "password123",
                "John",
                "Doe",
            );

            expect(result).toBe(true);
            expect(mockSave).toHaveBeenCalled();
        });

        it("should return false if save throws", async () => {
            mockSave.mockRejectedValue(new Error("Duplicate email"));

            const result = await service.createUser(
                "existing@example.com",
                "password123",
                "Jane",
                "Doe",
            );

            expect(result).toBe(false);
        });
    });

    describe("login", () => {
        it("should return the user if email and password match", async () => {
            const mockUser = {
                _id: "abc123",
                email: "test@example.com",
                password: "hashed_password123",
            };
            mockFind.mockResolvedValue([mockUser]);

            const result = await service.login(
                "test@example.com",
                "password123",
            );

            expect(result).toEqual(mockUser);
            expect(mockFind).toHaveBeenCalledWith({
                email: "test@example.com",
            });
        });

        it("should return null if no user is found", async () => {
            mockFind.mockResolvedValue([]);

            const result = await service.login(
                "unknown@example.com",
                "password123",
            );

            expect(result).toBeNull();
        });

        it("should return null if password does not match", async () => {
            const mockUser = {
                _id: "abc123",
                email: "test@example.com",
                password: "hashed_correctpassword",
            };
            mockFind.mockResolvedValue([mockUser]);

            const result = await service.login(
                "test@example.com",
                "wrongpassword",
            );

            expect(result).toBeNull();
        });

        it("should return null if find throws an error", async () => {
            mockFind.mockRejectedValue(new Error("DB error"));

            const result = await service.login("test@example.com", "password");

            expect(result).toBeNull();
        });
    });
});
