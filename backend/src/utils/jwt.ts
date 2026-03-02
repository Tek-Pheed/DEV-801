import jwt from "jsonwebtoken";

/**
 * Create token using JWT for authentification
 * @param email email of the user
 * @param id unique identifier of the user
 * @returns Token in string
 */
export async function generateToken(
    email: string,
    id: string,
): Promise<string> {
    const secret = process.env.SECRET;
    if (!secret) {
        throw new Error("Error when creating token");
    }
    return jwt.sign({ email: email, id: id }, secret);
}
