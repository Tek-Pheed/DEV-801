import express from "express";
import request from "supertest";
import pingController from "../../src/controllers/ping.controller";

describe("GET /ping", () => {
    const app = express();
    app.use("/", pingController);

    it("should return 200 with OK message", async () => {
        const response = await request(app).get("/ping");

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ msg: "OK" });
    });
});
