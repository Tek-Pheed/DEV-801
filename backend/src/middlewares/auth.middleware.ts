import { NextFunction, Request, Response } from "express";
import Logger from "../utils/logger";
import jwt, { JwtPayload } from "jsonwebtoken";
import userModel from "../schemas/users.schema";

const SECRET = process.env.SECRET as string | undefined;

/**
 * Interface to store id and email of the user
 */
export interface JwtUserPayload extends JwtPayload {
    id: string;
    email: string;
}

/**
 * AuthenticatedRequest to have user param in Request
 */
export interface AuthenticatedRequest extends Request {
    user?: JwtUserPayload;
}

/**
 * Verify if the email and the id correspond to the same user in db
 * @param email user_email from the decrypted token
 * @param id user_id from gthe decrypted token
 * @returns true or false
 */

async function verifyUser(email: string, id: string) {
    const user = await userModel.find({email: email, _id: id})
    if (user.length < 1) {
        return false
    } else {
        return true
    }
}

/**
 * Verify if the user is correctly authenticated in the server
 * @param req Express request
 * @param res Express Response
 * @param next Express Next
 * @returns user information inside the request
 */
const auth = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
) => {
    try {
        const authorization = req.headers.authorization;
        if (!authorization) {
            return res.status(401).json({
                msg: "Missing token",
            });
        }
        const token = authorization.split(" ")[1];

        if (!SECRET) {
            return res.status(500).json({
                msg: "Internal Server Error",
            });
        }

        const decoded = jwt.verify(token, SECRET) as JwtUserPayload;
        if (!(await verifyUser(decoded.email, decoded.id))) {
            return res.status(401).json({
            msg: "Invalid user",
        });
        }
        req.user = decoded;
        return next();
    } catch (err) {
        Logger.error(err);
        return res.status(401).json({
            msg: "Invalid token",
        });
    }
};

export default auth;
