import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import Logger from "./utils/logger";
import { connect } from "mongoose";
import cors from "cors";

import stripeController from "./controllers/stripe.controller";
import pingController from "./controllers/ping.controller";

// EXPRESS CONFIG
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

// MONGO CONFIG
const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/DEV-801";

// ROUTES CONFIG

app.use((req: Request, res: Response, next: NextFunction) => {
    const ip =
        req.headers["x-forwarded-for"]?.toString().split(",")[0].trim() ||
        req.socket.remoteAddress ||
        req.ip;

    Logger.info({ method: req.method, url: req.url, body: req.body, ip });

    next();
});

app.use("/api/stripe", stripeController);
app.use("/api/", pingController);

// API START POINT
connect(mongoURI)
    .then(() => {
        app.listen(port, () => {
            Logger.info(`API listen on port ${port}`);
        });
    })
    .catch(() => {
        Logger.error("Connexion impossible à la base de donnée");
    });
