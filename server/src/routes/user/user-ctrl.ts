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
    if (!user) throw "User not found";
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
    if (!user) throw "User not found";
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
    if (!user) throw "User not found";
    if (!(user.id.toString() === JWTPayload.userID || JWTPayload.admin)) throw "Unauthorized to perform this action";

    user.password = newPassword;
    await user.validate();
    await user.save();

    return "Updated user password";
};

export const updatePhone = async (userID: IUser["_id"], newPhone: IUser["phone"], authorization: string) => {
    if (!newPhone) throw "New phone required in request body";

    const JWTPayload = <IUserJWTToken>jwt.verify(authorization, process.env.JWT_ENCRYPTION_SECRET as string);
    const user = await UserModel.findById(userID);
    if (!user) throw "User not found";
    if (!(user.id.toString() === JWTPayload.userID || JWTPayload.admin)) throw "Unauthorized to perform this action";

    user.phone = newPhone;
    await user.validate();
    await user.save();

    return "Updated user phone number";
};

export const deleteUser = async (userID: IUser["_id"], authorization: string) => {
    const JWTPayload = <IUserJWTToken>jwt.verify(authorization, process.env.JWT_ENCRYPTION_SECRET as string);
    if (!JWTPayload.admin) throw "Unauthorized to perform this action";

    await UserModel.findByIdAndRemove(userID);
    return "Deleted user";
};

export const login = async (emailOrPhone: IUser["email"] | IUser["phone"], password: IUser["password"]) => {
    const user = await UserModel.findOne().byEmailOrPhone(emailOrPhone);
    if (!user) throw "Invalid email or phone, and password";
    if (!await user.comparePassword(password)) throw "Invalid email or phone, and password";

    return jwt.sign({
        "fullName": user.fullName,
        "admin": user.admin,
        "userID": user._id
    }, process.env.JWT_ENCRYPTION_SECRET as string, {
        "expiresIn": 1.21e+9 // 2 weeks
    });
};

export const updateItems = async (userID: IUser["_id"], items: IUser["items"], authorization: string) => {
    const JWTPayload = <IUserJWTToken>jwt.verify(authorization, process.env.JWT_ENCRYPTION_SECRET as string);
    const user = await UserModel.findById(userID);
    if (!user) throw "User not found";
    if (!(user.id.toString() === JWTPayload.userID || JWTPayload.admin)) throw "Unauthorized to perform this action";
    console.log(items);
    await UserModel.findByIdAndUpdate(userID, { "addToSet": { items } });
    return "Updated items";
};

export const viewHistory = async (userID: IUser["_id"], authorization: string, page = 0) => {
    const JWTPayload = <IUserJWTToken>jwt.verify(authorization, process.env.JWT_ENCRYPTION_SECRET as string);
    const user = await UserModel.findById(userID);
    if (!user) throw "User not found";
    if (!(user.id.toString() === JWTPayload.userID || JWTPayload.admin)) throw "Unauthorized to perform this action";

    return user.history.slice(20 * page, 20 * (page + 1));
};
