import { Response, Router } from "express";
import auth, { AuthenticatedRequest } from "../middlewares/auth.middleware";
import Logger from "../utils/logger";
import ProductsService from "../services/products.service";

const router: Router = Router();
const service = new ProductsService();

/**
 * @openapi
 * /api/products/:
 *   get:
 *     summary: Get all products available
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of products
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Internal server error
 */
router.get("/", auth, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user = req.user;

        if (!user) {
            res.status(401).json({
                msg: "Not authenticated",
            });
            return;
        }

        const data = await service.getProducts();
        res.status(200).json(data);
    } catch (err) {
        Logger.error(err);
        res.status(500).json({
            msg: "Internal Server Error",
        });
        return;
    }
});

/**
 * @openapi
 * /api/products/:productID:
 *   get:
 *     summary: Get specific product by ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: product detail
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Internal server error
 *     parameters:
 *        - in: params
 *          name: productID
 *          schema:
 *            type: string
 *          required: true
 *          description: Unique identifier of the product
 */
router.get(
    "/:productID",
    auth,
    async (req: AuthenticatedRequest, res: Response) => {
        try {
            const user = req.user;
            const productID = req.params.productID;

            if (!user) {
                res.status(401).json({
                    msg: "Not authenticated",
                });
                return;
            }

            const data = await service.getProductByID(productID.toString());
            res.status(200).json(data);
        } catch (err) {
            Logger.error(err);
            res.status(500).json({
                msg: "Internal Server Error",
            });
            return;
        }
    },
);

/**
 * @openapi
 * /api/products/:code:
 *   get:
 *     summary: Get specific product by code
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: product detail
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Internal server error
 *     parameters:
 *        - in: params
 *          name: code
 *          schema:
 *            type: string
 *          required: true
 *          description: Code of the product
 */
router.get("/:code", auth, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user = req.user;
        const productID = req.params.code;

        if (!user) {
            res.status(401).json({
                msg: "Not authenticated",
            });
            return;
        }

        const data = await service.getProductByID(productID.toString());
        res.status(200).json(data);
    } catch (err) {
        Logger.error(err);
        res.status(500).json({
            msg: "Internal Server Error",
        });
        return;
    }
});

export default router;
