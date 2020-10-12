import UserModel, { IUser } from "../../database/models/UserModel";
import handleError, { handleSuccess } from "../../utils/handleError";

export const createUser = async (userObject: IUser) => {
    try {
        const user = new UserModel(userObject);
        await user.validate();
        await user.save();

        return handleSuccess()
    } catch (err) {
        handleError(err);
    }
}
