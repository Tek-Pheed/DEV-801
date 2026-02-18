import { Request, Response, Router } from "express";
import { StripeService } from "../services/stripe.service";
import Logger from "../utils/logger";

const router: Router = Router();
const service = new StripeService();

router.post("/pay", async (req: Request, res: Response) => {
    try {
        const { products } = req.body;

        const result = await service.createPaymentLink(products);
        if (result !== null) {
            res.status(200).json(result.url);
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

router.get("/invoices/:email", async (req: Request, res: Response) => {
    try {
        const email = req.params.email;

        if (!email) {
            return res.status(400).json({
                msg: "Wrong informations",
            });
        }

        const result = await service.getInvoices(`${email}`);
        if (result !== null) {
            return res.status(200).json(result);
        } else {
            return res.status(400).json({
                msg: "Wrong informations",
            });
        }
    } catch (err) {
        Logger.error(err);
        return res.status(500).json({
            msg: "Internal server error",
        });
    }
});

export default router;
