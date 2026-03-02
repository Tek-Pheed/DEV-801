import Stripe from "stripe";
import { IProducts } from "../schemas/products.schema";
import { convertIntoStripeProduct } from "../utils/converter";
import Logger from "../utils/logger";
import { orderStatus } from "../schemas/order.schema";
import { JwtUserPayload } from "../middlewares/auth.middleware";
import OrderService from "./order.service";

const stripe = new Stripe(`${process.env.STRIPE_PRIVATE_KEY}`);

export class StripeService {
    private orderService = new OrderService();

    /**
     * Create payment link using stripe API
     * @param {IProducts[]} products list of products
     * @param {JwtUserPayload} user Authenticated user
     * @param {string} token Token of an authenticated user
     * @returns PaymentLinks | null
     */
    async createPaymentLink(
        products: IProducts[],
        user: JwtUserPayload,
        token: string,
    ) {
        try {
            const items: any[] = await convertIntoStripeProduct(products);

            const orderID = await this.orderService.createOrder(
                products,
                user.id,
                "Stripe",
            );

            return await stripe.paymentLinks.create({
                line_items: items,
                invoice_creation: {
                    enabled: true,
                },
                after_completion: {
                    type: "redirect",
                    redirect: {
                        url: `${process.env.HOST}/stripe/payment_callback/?token=${token}&orderID=${orderID}&status=${orderStatus.validated}`,
                    },
                },
            });
        } catch (err) {
            Logger.error(err);
            return null;
        }
    }

    /**
     * Get all invoices by email of the user
     * @param {String} email email of the user
     * @returns Invoice | null
     */
    async getInvoices(email: String) {
        try {
            const customers = await stripe.customers.list({
                email: `${email}`,
                limit: 1,
            });

            if (customers.data.length === 0) {
                throw new Error("Client non trouvé");
            }

            const customerId = customers.data[0].id;

            return await stripe.invoices.search({
                query: `customer:"${customerId}"`,
            });
        } catch (err) {
            Logger.error(err);
            return null;
        }
    }
}
