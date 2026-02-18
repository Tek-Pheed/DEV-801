import jwt, { JwtPayload } from 'jsonwebtoken';

export async function generateToken(email: string, id: string): Promise<string> {
    const secret = process.env.SECRET;
    if (!secret) {
        throw new Error('Error when creating token');
    }
    return jwt.sign({ email: email, id: id}, secret);
}