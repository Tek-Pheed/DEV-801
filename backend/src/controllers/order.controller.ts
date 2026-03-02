import { Response, Router } from "express";
import auth, { AuthenticatedRequest } from "../middlewares/auth.middleware";
import Logger from "../utils/logger";
import OrderService from "../services/order.service";

const router: Router = Router();
const service = new OrderService();

/**
 * @openapi
 * /api/orders/:
 *   get:
 *     summary: Get all orders from an user
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: List of orders
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Internal server error
 *       400:
 *         description: Wrong information sent
 */
router.get("/", auth, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user = req.user;

        if (!user) {
            res.status(401).json({
                msg: "Forbidden access",
            });
            return;
        }
        const data = await service.getOrders(user.id);
        if (!data) {
            res.status(400).json({
                msg: "No orders found !",
            });
            return;
        }
        res.status(200).json(data);
    } catch (err) {
        Logger.error(err);
        res.status(500).json({
            msg: "Internal server error",
        });
        return;
    }
});

/**
 * @openapi
 * /api/orders/validate:
 *   post:
 *     summary: Validate specific order by ID
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Order validated
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Internal server error
 */
router.post(
    "/validate",
    auth,
    async (req: AuthenticatedRequest, res: Response) => {
        try {
            const user = req.user;
            const { status, orderID } = req.body;

            if (!user) {
                res.status(401).json({
                    msg: "Not authenticated",
                });
                return;
            }

            if (!status || !orderID) {
                res.status(400).json({
                    msg: "Invalid request",
                });
                return;
            }

            const result = await service.updateStatusOrder(orderID, status);

            if (result) {
                res.status(200).json({
                    msg: "Order updated",
                });
                return;
            } else {
                res.status(400).json({
                    msg: "Invalid request",
                });
                return;
            }
        } catch (err) {
            Logger.error(err);
            res.status(500).json({
                msg: "Internal Server Error",
            });
            return;
        }
    },
);

export default router;
