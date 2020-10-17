import UserModel, { IUser, IUserJWTToken } from "../../database/models/UserModel";
import jwt from "jsonwebtoken";

export const createUser = async (userObject: Partial<IUser>) => {
    const user = new UserModel({
        "firstName": userObject.firstName,
        "lastName": userObject.lastName,
        "email": userObject.email,
        "phone": userObject.phone,
        "password": userObject.password
    });

    await user.validate();
    await user.save();

    return "Registered user";
};

export const getUser = async (jwtToken: string) => {
    const JWTPayload = <IUserJWTToken>jwt.verify(jwtToken, process.env.JWT_ENCRYPTION_SECRET as string);
    return UserModel.findById(JWTPayload.userID)
      .populate("items");
};

export const isAdmin = async (jwtToken: string) => {
    const JWTPayload = <IUserJWTToken>jwt.verify(jwtToken, process.env.JWT_ENCRYPTION_SECRET as string);
    return JWTPayload.admin;
};

export const updateName = async (
  userID: IUser["_id"],
  [firstName, lastName]: [IUser["firstName"], IUser["lastName"]],
  authorization: string
) => {
    if (!firstName) throw "First name required in request body";

    const JWTPayload = <IUserJWTToken>jwt.verify(authorization, process.env.JWT_ENCRYPTION_SECRET as string);
    const user = await UserModel.findById(userID);
    if (!user) throw "User not found"
    if (!(user.id.toString() === JWTPayload.userID || JWTPayload.admin)) throw "Unauthorized to perform this action";

    user.firstName = firstName;
    user.lastName = lastName;
    await user.validate();
    await user.save();

    return "Updated name";
};

export const updateEmail = async (userID: IUser["_id"], newEmail: IUser["email"], authorization: string) => {
    if (!newEmail) throw "New email required in request body";

    const JWTPayload = <IUserJWTToken>jwt.verify(authorization, process.env.JWT_ENCRYPTION_SECRET as string);
    const user = await UserModel.findById(userID);
    if (!user) throw "User not found"
    if (!(user.id.toString() === JWTPayload.userID || JWTPayload.admin)) throw "Unauthorized to perform this action";

    user.email = newEmail;
    await user.validate();
    await user.save();

    return "Updated email address";
};

export const updatePassword = async (userID: IUser["_id"], newPassword: IUser["password"], authorization: string) => {
    if (!newPassword) throw "New password required in request body";

    const JWTPayload = <IUserJWTToken>jwt.verify(authorization, process.env.JWT_ENCRYPTION_SECRET as string);
    const user = await UserModel.findById(userID);
    if (!user) throw "User not found"
    if (!(user.id.toString() === JWTPayload.userID || JWTPayload.admin)) throw "Unauthorized to perform this action";

    user.password = newPassword;
    await user.validate();
    await user.save();

    return "Updated user password";
};

export const updatePhone  = async (userID: IUser["_id"], newPhone: IUser["phone"], authorization: string) => {
    if (!newPhone) throw "New phone required in request body";

    const JWTPayload = <IUserJWTToken>jwt.verify(authorization, process.env.JWT_ENCRYPTION_SECRET as string);
    const user = await UserModel.findById(userID);
    if (!user) throw "User not found"
    if (!(user.id.toString() === JWTPayload.userID || JWTPayload.admin)) throw "Unauthorized to perform this action";

    user.phone = newPhone;
    await user.validate();
    await user.save();

    return "Updated user phone number";
};

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
