import { IProducts } from "../schemas/products.schema";
import orderModel, { orderStatus } from "../schemas/order.schema";
import Logger from "../utils/logger";

class OrderService {
    /**
     * Create new order with products in details and linked to an userID
     * @param products list of products
     * @param userID unique identifier of the user
     * @param method payment method (Stripe or Paypal)
     * @returns unique identifier of the order
     */
    async createOrder(products: IProducts[], userID: String, method: String) {
        try {
            const order = new orderModel({
                userID: userID,
                products: products,
                method: method,
            });
            const result = await order.save();
            return result.id;
        } catch (err) {
            Logger.error(err);
            return null;
        }
    }

    /**
     * Update the status of a specific order
     * @param orderID Unique identifier of an order
     * @param status Status of the order
     * @returns true or false
     */
    async updateStatusOrder(orderID: String, status: orderStatus) {
        try {
            const test = await orderModel.findByIdAndUpdate(orderID, {
                $set: { status: status },
            });
            Logger.info(test);
            return true;
        } catch (err) {
            Logger.error(err);
            return false;
        }
    }

    /**
     * Get all orders for a specific userID
     * @param userID Unique identifier of an user
     * @returns
     */
    async getOrders(userID: String) {
        try {
            const result = await orderModel.find({ userID: userID });
            return result;
        } catch (err) {
            Logger.error(err);
            return null;
        }
    }

    /*async finalizeOrder(userID: String, orderID: String, status: orderStatus) {
        try {
            const userID = "";
            const result = await updateStatusOrder(orderID, status);

            if (status == orderStatus.validated) {
                this.historyService.addInHistory(userID, orderID);
            }

            return result;
        } catch (err) {
            Logger.error(err);
            return false;
        }
    }*/
}

export default OrderService;
