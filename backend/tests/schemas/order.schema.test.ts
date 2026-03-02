import { orderStatus } from "../../src/schemas/order.schema";

describe("orderStatus enum", () => {
    it("should have a pending status", () => {
        expect(orderStatus.pending).toBe("Pending");
    });

    it("should have a validated status", () => {
        expect(orderStatus.validated).toBe("Validated");
    });

    it("should have a canceled status", () => {
        expect(orderStatus.canceled).toBe("Canceled");
    });

    it("should have exactly 3 statuses", () => {
        const values = Object.values(orderStatus);
        expect(values).toHaveLength(3);
    });
});
