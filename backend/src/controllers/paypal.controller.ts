import { Request, Response, Router } from "express";
import { PaypalService } from "../services/paypal.service";
import Logger from "../utils/logger";
import { orderStatus } from "../schemas/order.schema";
import auth, { AuthenticatedRequest } from "../middlewares/auth.middleware";

const router: Router = Router();
const service = new PaypalService();

/**
 * @openapi
 * /api/paypal/pay:
 *   post:
 *     summary: Create payment link to pay an order
 *     tags: [Paypal]
 *     responses:
 *       200:
 *         description: Link to the payment page
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Internal server error
 *       400:
 *         description: Wrong information sent
 */
router.post("/pay", auth, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { products } = req.body;
        const user = req.user;
        const token = req.headers.authorization!.split(" ")[1];

        if (!user) {
            res.status(401).json({
                msg: "Not authenticated",
            });
            return;
        }

        const result: any = await service.createPaymentLink(
            products,
            user,
            token,
        );
        console.log(result);
        if (result !== null) {
            res.status(200).json(result.links[1].href);
        } else {
            res.status(400).json({
                msg: "Wrong informations",
            });
        }
    } catch (err) {
        Logger.error(err);
        res.status(500).json({
            msg: "Internal server error",
        });
    }
});

/**
 * @openapi
 * /api/paypal/payment_callback/?token={token}&orderID={orderID}&status={status}:
 *   get:
 *     summary: Callback after payment
 *     tags: [Paypal]
 *     responses:
 *       200:
 *         description: token and orderID
 *       500:
 *         description: Internal server error
 *       400:
 *         description: Wrong information sent
 *     parameters:
 *        - in: query
 *          name: token
 *          schema:
 *            type: string
 *          required: true
 *          description: token of the authenticated user
 *        - in: query
 *          name: orderID
 *          schema:
 *            type: string
 *          required: true
 *          description: unique identifier of the order
 *        - in: query
 *          name: status
 *          schema:
 *            type: string
 *          required: true
 *          description: status of the order
 */
router.get("/payment_callback/", async (req: Request, res: Response) => {
    try {
        const { orderID, token, status } = req.query;

        if (!orderID || !token || !status) {
            res.status(400).json({
                msg: "Invalid request",
            });
            return;
        }

        res.status(200).json({
            token: `${token}`,
            orderID: orderID,
            status: status,
        });
    } catch (err) {
        Logger.error(err);
        res.status(500).json({
            msg: "Internal Server Error",
        });
    }
});

export default router;
