import jwt from "jsonwebtoken";

const TEST_SECRET = "test-secret-for-auth-middleware";

jest.mock("../../src/utils/logger", () => ({
    __esModule: true,
    default: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
    },
}));

describe("auth middleware", () => {
    let auth: any;

    beforeEach(() => {
        jest.resetModules();
        process.env.SECRET = TEST_SECRET;
        auth = require("../../src/middlewares/auth.middleware").default;
    });

    afterEach(() => {
        delete process.env.SECRET;
    });

    function mockRes() {
        const res: any = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        return res;
    }

    it("should return 401 if no authorization header is provided", async () => {
        const req: any = { headers: {} };
        const res = mockRes();
        const next = jest.fn();

        await auth(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ msg: "Missing token" });
        expect(next).not.toHaveBeenCalled();
    });

    it("should return 401 if token is invalid", async () => {
        const req: any = {
            headers: { authorization: "Bearer invalid-token" },
        };
        const res = mockRes();
        const next = jest.fn();

        await auth(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ msg: "Invalid token" });
        expect(next).not.toHaveBeenCalled();
    });

    it("should call next and set req.user for a valid token", async () => {
        const payload = { email: "test@example.com", id: "user123" };
        const token = jwt.sign(payload, TEST_SECRET);
        const req: any = {
            headers: { authorization: `Bearer ${token}` },
        };
        const res = mockRes();
        const next = jest.fn();

        await auth(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(req.user).toBeDefined();
        expect(req.user.email).toBe("test@example.com");
        expect(req.user.id).toBe("user123");
    });

    it("should return 500 if SECRET is not defined", async () => {
        delete process.env.SECRET;
        jest.resetModules();
        const authNoSecret =
            require("../../src/middlewares/auth.middleware").default;

        const token = jwt.sign({ email: "a@b.com", id: "1" }, "any-secret");
        const req: any = {
            headers: { authorization: `Bearer ${token}` },
        };
        const res = mockRes();
        const next = jest.fn();

        await authNoSecret(req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            msg: "Internal Server Error",
        });
    });
});
