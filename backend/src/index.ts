import "dotenv/config";
import express from "express";
import Logger from "./utils/logger";
import { connect } from "mongoose";
import cors from "cors";
import { authController } from "./controllers/auth.controllers";

// EXPRESS CONFIG
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json())
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// MONGO CONFIG
const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017";

// API START POINT

app.use("/api/auth",authController);

connect(mongoURI)
    .then(() => {
        app.listen(port, () => {
            Logger.info(`API listen on port ${port}`);
        });
    })
    .catch(() => {
        Logger.error("Connexion impossible à la base de donnée");
    });
