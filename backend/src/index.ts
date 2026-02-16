import "dotenv/config";
import express from "express";
import Logger from "./utils/logger";
import { connect } from "mongoose";
import cors from "cors";

// EXPRESS CONFIG
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: false }));
app.use(cors());

// MONGO CONFIG
const mongoURI = process.env.MONGO_URI || "mongosrv://localhost:27010/";

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
