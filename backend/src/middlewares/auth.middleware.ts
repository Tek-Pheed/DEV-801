import { NextFunction, Request, Response } from "express";
import Logger from "../utils/logger";
import jwt, { JwtPayload } from "jsonwebtoken";

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
        //TODO : verify if the email is correct
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
