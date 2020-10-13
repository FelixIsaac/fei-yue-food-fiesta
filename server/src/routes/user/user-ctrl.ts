import UserModel, { IUser, IUserModel } from "../../database/models/UserModel";
import handleError, { handleSuccess } from "../../utils/handleError";

export const isAdmin = async (userID: IUser["_id"]) => {
    const user = (await UserModel.findById(userID))
    if (!user) return false;
    return user.admin;
};

export const createUser = async (userObject: Partial<IUser>) => {
    try {
        const user = new UserModel(userObject);
        await user.validate();
        await user.save();

        return handleSuccess("Registered user");
    } catch (err) {
        return handleError(err);
    }
};

export const amend = async (userID: IUser["_id"], path: string, update: string) => {
    try {
        const user = await UserModel.findById(userID);
        if (!user) throw "User not found";
        if (!(path in user.toJSON())) throw "Not a path in user";

        // @ts-ignore
        user[path] = update;
        await user.validate();
        await user.save();
        return handleSuccess(`Updated ${path}`)
    } catch (err) {
        return handleError(err);
    }
};

export const login = async (emailOrPhone: IUser["email"] | IUser["phone"], password: IUser["password"]) => {
    try {
        const user = await UserModel.findOne().byEmailOrPhone(emailOrPhone);
        if (!user) throw "Invalid email or phone, and password";
        // @ts-ignore
        if (!await user.comparePassword(password)) throw "Invalid email or phone, and password";

        return handleSuccess("Correct credentials");
    } catch (err) {
        return handleError(err);
    }
};

// export const removeAccount = async ()
