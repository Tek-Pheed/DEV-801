import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import Logger from "./utils/logger";
import { connect } from "mongoose";
import cors from "cors";
import swaggerUI from "swagger-ui-express";
import { swagger } from "./utils/swagger";

// CONTROLLERS
import stripeController from "./controllers/stripe.controller";
import pingController from "./controllers/ping.controller";
import { authController } from "./controllers/auth.controller";
import orderController from "./controllers/order.controller";
import productController from "./controllers/products.controller";
import paypalController from "./controllers/paypal.controller";
import { openFoodFactsMigrationLocal } from "./utils/openFoodFacts";

// EXPRESS CONFIG
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

// MONGO CONFIG
const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/DEV-801";

// API START POINT

app.use("/api/stripe", stripeController);
app.use("/api/orders", orderController);
app.use("/api/auth", authController);
app.use("/api/paypal", paypalController);
app.use("/api/products", productController);
app.use("/api/", pingController);
app.use("/docs", swaggerUI.serve, swaggerUI.setup(swagger));

// API START POINT
connect(mongoURI)
    .then(() => {
        app.listen(port, () => {
            Logger.info(`API listen on port ${port}`);

            openFoodFactsMigrationLocal()
                .then(() => {
                    Logger.info("Product loaded succesfully in MongoDB");
                })
                .catch((err) => {
                    Logger.error(err);
                });
        });
    })
    .catch(() => {
        Logger.error("Connexion impossible à la base de donnée");
    });
