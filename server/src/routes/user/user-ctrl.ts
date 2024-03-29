import jwt from "jsonwebtoken";
import QRCode from "qrcode";
import UserModel, { IUserDocument, IUserJWTToken } from "../../database/models/UserModel";
import { decrypt } from "../../utils/encryption";
import ItemModel from "../../database/models/ItemModel";
import OrderModel, { IOrderDocument } from "../../database/models/OrderModel";

export const createUser = async (userObject: Partial<IUserDocument>) => {
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

export const getUser = async (jwtToken: string, opts: { decryptEmail: boolean, decryptPhone: boolean } = {
    decryptEmail: false,
    decryptPhone: false
}) => {
    const JWTPayload = <IUserJWTToken>jwt.verify(jwtToken, process.env.JWT_ENCRYPTION_SECRET as string);
    const user = await UserModel.findById(JWTPayload.userID)
      .select("-password -history")
      .populate("items")
      .exec();

    if (!user) throw "User not found";
    if (opts.decryptEmail) user.email = decrypt(user.email);
    if (opts.decryptPhone) user.phone = decrypt(user.phone);

    return user;
};

export const isAdmin = async (jwtToken: string) => {
    const JWTPayload = <IUserJWTToken>jwt.verify(jwtToken, process.env.JWT_ENCRYPTION_SECRET as string);
    return JWTPayload.admin;
};

export const updateName = async (
  userID: IUserDocument["_id"],
  [firstName, lastName]: [IUserDocument["firstName"], IUserDocument["lastName"]],
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

export const updateEmail = async (userID: IUserDocument["_id"], newEmail: IUserDocument["email"], authorization: string) => {
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

export const updatePassword = async (
  userID: IUserDocument["_id"],
  newPassword: IUserDocument["password"],
  oldPassword: IUserDocument["password"],
  authorization: string
) => {
    if (!(newPassword || oldPassword)) throw "New password and old password required in request body";

    const JWTPayload = <IUserJWTToken>jwt.verify(authorization, process.env.JWT_ENCRYPTION_SECRET as string);
    const user = await UserModel.findById(userID);
    if (!user) throw "User not found";
    if (!(user.id.toString() === JWTPayload.userID || JWTPayload.admin)) throw "Unauthorized to perform this action";
    if (!await user.comparePassword(oldPassword)) throw "Invalid old password";

    user.password = newPassword;
    await user.validate();
    await user.save();

    return "Updated user password";
};

export const updatePhone = async (userID: IUserDocument["_id"], newPhone: IUserDocument["phone"], authorization: string) => {
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

export const deleteUser = async (userID: IUserDocument["_id"], authorization: string) => {
    const JWTPayload = <IUserJWTToken>jwt.verify(authorization, process.env.JWT_ENCRYPTION_SECRET as string);
    if (!JWTPayload.admin) throw "Unauthorized to perform this action";

    await UserModel.findByIdAndRemove(userID);
    return "Deleted user";
};

export const login = async (emailOrPhone: IUserDocument["email"] | IUserDocument["phone"], password: IUserDocument["password"]) => {
    const user = await UserModel.findOne().byEmailOrPhone(emailOrPhone);
    if (!user) throw "Invalid email or phone, and password";
    if (!await user.comparePassword(password)) throw "Invalid email or phone, and password";

    const payload = {
        "fullName": user.fullName,
        "admin": user.admin,
        "userID": user._id,
        "avatar": user.avatar
    };

    return {
        "token": jwt.sign(payload, process.env.JWT_ENCRYPTION_SECRET as string, {
            "expiresIn": 1.21e+9 // 2 weeks
        }), payload
    };
};

export const updateItems = async (userID: IUserDocument["_id"], items: IUserDocument["items"], authorization: string) => {
    const JWTPayload = <IUserJWTToken>jwt.verify(authorization, process.env.JWT_ENCRYPTION_SECRET as string);
    const user = await UserModel.findById(userID);
    if (!user) throw "User not found";
    if (!(user.id.toString() === JWTPayload.userID || JWTPayload.admin)) throw "Unauthorized to perform this action";

    await UserModel.findByIdAndUpdate(userID, { "$set": { items } });
    return "Updated items";
};

export const resetItems = async (userID: IUserDocument["_id"], authorization: string) => {
    const JWTPayload = <IUserJWTToken>jwt.verify(authorization, process.env.JWT_ENCRYPTION_SECRET as string);
    if (!JWTPayload.admin) throw "Unauthorized to perform this action";
    const user = await UserModel.findById(userID);
    if (!user) throw "User not found";

    user.history.push(user.items);
    user.items = [];
    await user.save();

    return "Reset user items";
};

export const viewHistory = async (userID: IUserDocument["_id"], authorization: string, page = 0) => {
    const JWTPayload = <IUserJWTToken>jwt.verify(authorization, process.env.JWT_ENCRYPTION_SECRET as string);
    const user = await UserModel.findById(userID);
    if (!user) throw "User not found";
    if (!(user.id.toString() === JWTPayload.userID || JWTPayload.admin)) throw "Unauthorized to perform this action";

    return user.history.slice(20 * page, 20 * (page + 1));
};

export const getOrder = async (userID: IUserDocument["_id"], authorization: string) => {
    const JWTPayload = <IUserJWTToken>jwt.verify(authorization, process.env.JWT_ENCRYPTION_SECRET as string);
    const user = await UserModel.findById(userID);

    if (!user) throw "User not found";
    if (!(user.id.toString() === JWTPayload.userID || JWTPayload.admin)) throw "Unauthorized to perform this action";

    const orderToken = jwt.sign(
      { "id": user._id, "items": user.items || [] },
      process.env.JWT_ENCRYPTION_SECRET as string,
      { "expiresIn": 60 * 60 * 24 }
    );

    return {
        "userID": user._id,
        "QRCode": await QRCode.toDataURL(orderToken, { "errorCorrectionLevel": "H" }),
        orderToken
    };
};

export const getTokenOrder = async (orderToken: string, authorization: string) => {
    const JWTPayload = <IUserJWTToken>jwt.verify(authorization, process.env.JWT_ENCRYPTION_SECRET as string);
    const OrderToken = <{ id: IUserDocument["_id"], items: IUserDocument["items"] }>
      jwt.verify(orderToken, process.env.JWT_ENCRYPTION_SECRET as string);
    const user = await UserModel.findById(OrderToken.id).select("firstName lastName admin avatar");

    if (!user) throw "User not found";
    if (!JWTPayload.admin) throw "Unauthorized to perform this action";

    return {
        "items": await ItemModel
          .find({ "_id": { "$in": OrderToken.items } })
          .populate("category").lean().exec(),
        "user": {
            "_id": OrderToken.id,
            "firstName": user.firstName,
            "lastName": user.lastName,
            "fullName": user.fullName,
            "avatar": user.avatar
        }
    };
};

export const registerOrder = async (orderToken: string, authorization: string) => {
    const JWTPayload = <IUserJWTToken>jwt.verify(authorization, process.env.JWT_ENCRYPTION_SECRET as string);
    const OrderToken = <{ id: IUserDocument["_id"], items: IUserDocument["items"] }>
      jwt.verify(orderToken, process.env.JWT_ENCRYPTION_SECRET as string);
    const user = await UserModel.findById(OrderToken.id)

    if (!user) throw "User not found";
    if (!JWTPayload.admin) throw "Unauthorized to perform this action";

    if (await OrderModel.exists({ "user": OrderToken.id }))
        await OrderModel.findOneAndRemove({ "user": OrderToken.id });

    const { _id: orderID } = await new OrderModel({ "user": OrderToken.id, "items": OrderToken.items }).save();
    await resetItems(OrderToken.id, authorization);

    return {
        "items": await ItemModel
          .find({ "_id": { "$in": OrderToken.items } })
          .populate("category").lean().exec(),
        "user": {
            "_id": OrderToken.id,
            "firstName": user.firstName,
            "lastName": user.lastName,
            "fullName": user.fullName,
            "avatar": user.avatar
        },
        "_id": orderID
    };
};

export const completeOrder = async (orderID: IOrderDocument["_id"], authorization: string) => {
    const JWTPayload = <IUserJWTToken>jwt.verify(authorization, process.env.JWT_ENCRYPTION_SECRET as string);
    if (!JWTPayload.admin) throw "Unauthorized to perform this action";

    await OrderModel.findByIdAndRemove(orderID);
    return "Completed order, now removing from order list"
};
