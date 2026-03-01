import { randomUUID } from "crypto";
import { IProducts } from "../schemas/products.schema";
import { convertIntoPaypalProduct, sumOfProducts } from "../utils/converter";
import Logger from "../utils/logger";
import OrderService from "./order.service";
import { orderStatus } from "../schemas/order.schema";
import { JwtUserPayload } from "../middlewares/auth.middleware";

export class PaypalService {
    private token = "";
    private orderService = new OrderService();

    public constructor() {
        const urlencoded = new URLSearchParams();
        urlencoded.append("grant_type", "client_credentials");

        const credentials = Buffer.from(
            `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`,
        ).toString("base64");

        fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token", {
            headers: {
                Authorization: `Basic ${credentials}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            method: "POST",
            body: urlencoded,
        })
            .then((response) => response.json())
            .then((data) => {
                Logger.info("Connexion Paypal OK");
                this.token = data.access_token;
            });
    }

    /**
     * Create payment link to Paypal with list of products
     * @param products list of products
     * @param user user authenticated from the request
     * @param token user token from the request
     * @returns api paypal response
     */
    async createPaymentLink(
        products: IProducts[],
        user: JwtUserPayload,
        token: String,
    ) {
        const items: any[] = await convertIntoPaypalProduct(products);

        const total = await sumOfProducts(products);

        const id = await this.orderService.createOrder(
            products,
            user.id,
            "Paypal",
        );
        const uid = randomUUID();

        if (id == null) {
            return null;
        }

        const result = await fetch(
            "https://api-m.sandbox.paypal.com/v2/checkout/orders",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "PayPal-Request-Id": uid,
                },
                body: JSON.stringify({
                    intent: "CAPTURE",
                    payment_source: {
                        paypal: {
                            experience_context: {
                                payment_method_preference:
                                    "IMMEDIATE_PAYMENT_REQUIRED",
                                landing_page: "LOGIN",
                                shipping_preference: "GET_FROM_FILE",
                                user_action: "PAY_NOW",
                                return_url: `${process.env.HOST}/paypal/payment_callback/?token=${token}&orderID=${id}&status=${orderStatus.validated}`,
                                cancel_url: `${process.env.HOST}/paypal/payment_callback/?token=${token}&orderID=${id}&status=${orderStatus.canceled}`,
                            },
                        },
                    },
                    purchase_units: [
                        {
                            invoice_id: uid,
                            amount: {
                                currency_code: "EUR",
                                value: `${total}`,
                                breakdown: {
                                    item_total: {
                                        currency_code: "EUR",
                                        value: `${total}`,
                                    },
                                },
                            },
                            items: items,
                        },
                    ],
                }),
            },
        )
            .then((response) => {
                Logger.warn(response);
                return response.json();
            })
            .then((data) => {
                Logger.warn(data);
                return data;
            })
            .catch((err) => {
                Logger.error(err);
                return null;
            });
        return result;
    }
}
