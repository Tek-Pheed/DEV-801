jest.mock("../../src/utils/logger", () => ({
    __esModule: true,
    default: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
    },
}));

const mockOrderSave = jest.fn();
const mockOrderFind = jest.fn();
const mockFindByIdAndUpdate = jest.fn();

jest.mock("../../src/schemas/order.schema", () => {
    const MockModel = jest.fn().mockImplementation(() => ({
        save: mockOrderSave,
    }));
    (MockModel as any).find = mockOrderFind;
    (MockModel as any).findByIdAndUpdate = mockFindByIdAndUpdate;

    return {
        __esModule: true,
        default: MockModel,
        orderStatus: {
            pending: "Pending",
            validated: "Validated",
            canceled: "Canceled",
        },
    };
});

jest.mock("../../src/schemas/products.schema", () => ({
    productSchema: {},
}));

import OrderService from "../../src/services/order.service";
import { orderStatus } from "../../src/schemas/order.schema";

describe("OrderService", () => {
    let service: OrderService;

    beforeEach(() => {
        service = new OrderService();
        jest.clearAllMocks();
    });

    describe("createOrder", () => {
        it("should create an order and return its id", async () => {
            mockOrderSave.mockResolvedValue({ id: "order-id-123" });

            const products = [
                {
                    name: "Pain",
                    price: 100,
                    quantity: 1,
                    currency: "EUR",
                    imageURL: "",
                },
            ];

            const result = await service.createOrder(
                products,
                "user-id-456",
                "Stripe",
            );

            expect(result).toBe("order-id-123");
            expect(mockOrderSave).toHaveBeenCalled();
        });

        it("should return null if save fails", async () => {
            mockOrderSave.mockRejectedValue(new Error("Save failed"));

            const result = await service.createOrder([], "user-id", "Stripe");

            expect(result).toBeNull();
        });
    });

    describe("updateStatusOrder", () => {
        it("should update order status and return true", async () => {
            mockFindByIdAndUpdate.mockResolvedValue({ _id: "order-1" });

            const result = await service.updateStatusOrder(
                "order-1",
                orderStatus.validated,
            );

            expect(result).toBe(true);
            expect(mockFindByIdAndUpdate).toHaveBeenCalledWith("order-1", {
                $set: { status: orderStatus.validated },
            });
        });

        it("should return false if update fails", async () => {
            mockFindByIdAndUpdate.mockRejectedValue(
                new Error("Update failed"),
            );

            const result = await service.updateStatusOrder(
                "invalid-id",
                orderStatus.canceled,
            );

            expect(result).toBe(false);
        });
    });

    describe("getOrders", () => {
        it("should return orders for a user", async () => {
            const mockOrders = [
                { _id: "o1", userID: "u1", status: "Pending" },
                { _id: "o2", userID: "u1", status: "Validated" },
            ];
            mockOrderFind.mockResolvedValue(mockOrders);

            const result = await service.getOrders("u1");

            expect(result).toEqual(mockOrders);
            expect(mockOrderFind).toHaveBeenCalledWith({ userID: "u1" });
        });

        it("should return null if find fails", async () => {
            mockOrderFind.mockRejectedValue(new Error("DB error"));

            const result = await service.getOrders("u1");

            expect(result).toBeNull();
        });
    });
});
