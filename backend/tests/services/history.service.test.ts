jest.mock("../../src/utils/logger", () => ({
    __esModule: true,
    default: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
    },
}));

const mockHistoryFind = jest.fn();
const mockHistorySave = jest.fn();

jest.mock("../../src/schemas/history.schema", () => {
    const MockModel = jest.fn().mockImplementation(() => ({
        save: mockHistorySave,
    }));
    (MockModel as any).find = mockHistoryFind;
    return { __esModule: true, default: MockModel };
});

import HistoryService from "../../src/services/history.service";

describe("HistoryService", () => {
    let service: HistoryService;

    beforeEach(() => {
        service = new HistoryService();
        jest.clearAllMocks();
    });

    describe("getHistory", () => {
        it("should return history for a user", async () => {
            const mockHistory = [
                { orderID: "o1", userID: "u1" },
                { orderID: "o2", userID: "u1" },
            ];
            mockHistoryFind.mockResolvedValue(mockHistory);

            const result = await service.getHistory("u1");

            expect(result).toEqual(mockHistory);
            expect(mockHistoryFind).toHaveBeenCalledWith({ userID: "u1" });
        });

        it("should return null if find fails", async () => {
            mockHistoryFind.mockRejectedValue(new Error("DB error"));

            const result = await service.getHistory("u1");

            expect(result).toBeNull();
        });
    });

    describe("addInHistory", () => {
        it("should add a history entry and return true", async () => {
            mockHistorySave.mockResolvedValue(true);

            const result = await service.addInHistory("u1", "o1");

            expect(result).toBe(true);
            expect(mockHistorySave).toHaveBeenCalled();
        });

        it("should return false if save fails", async () => {
            mockHistorySave.mockRejectedValue(new Error("Save failed"));

            const result = await service.addInHistory("u1", "o1");

            expect(result).toBe(false);
        });
    });
});
