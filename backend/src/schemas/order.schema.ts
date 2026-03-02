import mongoose from "mongoose";
import { IProducts, productSchema } from "./products.schema";

export interface IOrders {
    _id: mongoose.Types.ObjectId;
    userID: mongoose.Types.ObjectId;
    products: IProducts[];
    status: orderStatus;
    orderDate: Date;
    method: String;
}

export enum orderStatus {
    pending = "Pending",
    validated = "Validated",
    canceled = "Canceled",
}

const orderSchema = new mongoose.Schema({
    userID: { type: mongoose.Types.ObjectId, required: true, ref: "users" },
    products: { type: [productSchema], required: true },
    status: {
        type: String,
        enum: Object.values(orderStatus),
        required: true,
        default: orderStatus.pending,
    },
    orderDate: { type: Date, required: true, default: Date.now },
    method: { type: String, required: true },
});

const orderModel = mongoose.model("orders", orderSchema, "orders");

export default orderModel;
