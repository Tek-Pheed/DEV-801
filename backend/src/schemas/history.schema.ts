import mongoose from "mongoose";

const historySchema = new mongoose.Schema({
    orderID: { type: mongoose.Types.ObjectId, required: true, ref: "orders" },
    userID: { type: mongoose.Types.ObjectId, required: true, ref: "users" },
});

const historyModel = mongoose.model("history", historySchema, "history");

export default historyModel;
