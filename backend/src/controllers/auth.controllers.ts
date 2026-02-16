import { Router, Request, Response } from "express"
import { AuthService } from "../services/auth.service";
import Logger from "../utils/logger";
import { generateToken } from "../utils/jwt";

const userService = new AuthService();

export const authController: Router = Router();

authController.post(
  "/register",
  async (req: Request, res: Response, next: any) => {
    try {
      const { firstName, lastName, email, password } = req.body;

      if (!firstName || !lastName || !email || !password) {
        Logger.error("Missing required fields");
      }

      const result = await userService.createUser(
        email,
        password,
        firstName,
        lastName,
      );
      if (result) {
        res.status(201).json({ message: "User created successfully." });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    } catch (err) {
      next(err);
    }
  },
);

authController.post(
  "/login",
  async (req: Request, res: Response, next: any) => {
    try {
      const { email, password} = req.body;

      if (!email || !password) {
        Logger.error("Missing required fields");
      }
      const result = await userService.login(email, password);
      if (result) {
        res
          .status(201)
          .json({ token: await generateToken(email, result._id.toString()) });

      } else {
        res.status(500).json({ message: "No account found" });
      }
    } catch (err) {
      Logger.error(err);
      next(err);
    }
  },
);