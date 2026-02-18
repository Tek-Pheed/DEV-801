import { Request, Response, Router } from "express";

const router: Router = Router();

router.get("/ping", async (_: Request, res: Response) => {
    res.status(200).json({ msg: "OK" });
});

export default router;
