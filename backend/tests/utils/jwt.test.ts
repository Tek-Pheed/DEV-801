import jwt from "jsonwebtoken";

const TEST_SECRET = "test-secret-key-for-unit-tests";

beforeEach(() => {
    process.env.SECRET = TEST_SECRET;
});

afterEach(() => {
    delete process.env.SECRET;
});

describe("generateToken", () => {
    it("should generate a valid JWT token", async () => {
        const { generateToken } = require("../../src/utils/jwt");

        const token = await generateToken("user@test.com", "abc123");

        expect(typeof token).toBe("string");
        const decoded = jwt.verify(token, TEST_SECRET) as any;
        expect(decoded.email).toBe("user@test.com");
        expect(decoded.id).toBe("abc123");
    });

    it("should throw an error when SECRET is not set", async () => {
        delete process.env.SECRET;
        jest.resetModules();
        const { generateToken } = require("../../src/utils/jwt");

        await expect(generateToken("user@test.com", "abc123")).rejects.toThrow(
            "Error when creating token",
        );
    });

    it("should produce different tokens for different users", async () => {
        const { generateToken } = require("../../src/utils/jwt");

        const token1 = await generateToken("user1@test.com", "id1");
        const token2 = await generateToken("user2@test.com", "id2");

        expect(token1).not.toBe(token2);
    });
});
