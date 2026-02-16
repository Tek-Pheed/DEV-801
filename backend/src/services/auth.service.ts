import userModel from '../schemas/users.schema';
import * as bcrypt from 'bcryptjs';
import Logger from '../utils/logger'

export class AuthService {
    async createUser(
        email: string,
        password: string,
        firstName: string,
        lastName: string,
    ): Promise<boolean> {
        try {
            const user = new userModel({
                email: email,
                password: bcrypt.hashSync(password, 10),
                firstName: firstName,
                lastName: lastName,
                creationDate: new Date(),
            });
            await user.save();
            return true;
        } catch (error) {
            Logger.error(error)
            return false;
        }
    }

    async login(email: string, password: string): Promise<any | null> {
        try {
            const user = await userModel.find({ email: email });
            if (user.length > 0 && bcrypt.compareSync(password, user[0].password)) {
                return user[0];
            }
            return null;
        } catch (error) {
            return null;
        }
    }
}