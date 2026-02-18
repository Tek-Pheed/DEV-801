import Stripe from "stripe";
import { IProducts } from "../models/products.model";
import { convertIntoStripeProduct } from "../utils/converter";
import Logger from "../utils/logger";

const stripe = new Stripe(`${process.env.STRIPE_PRIVATE_KEY}`);

export class StripeService {
    /**
     * Create payment link using stripe API
     * @param {IProducts[]} products
     * @returns PaymentLinks | null
     */
    async createPaymentLink(products: IProducts[]) {
        try {
            const items: any[] = await convertIntoStripeProduct(products);

            return await stripe.paymentLinks.create({
                line_items: items,
                invoice_creation: {
                    enabled: true,
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
