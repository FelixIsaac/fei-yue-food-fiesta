import CategoryModel, { ICategory } from "../../database/models/CategoryModel";
import ItemModel, { IItem } from "../../database/models/ItemModel";
import OrderModel from "../../database/models/OrderModel";
import { getUser, isAdmin } from "../user/user-ctrl";
import { IUserJWTToken } from "../../database/models/UserModel";
import jwt from "jsonwebtoken";

export const createCategory = async (name: ICategory["category"], authorization: string) => {
    if (!await isAdmin(authorization)) throw "Unauthorized to perform this action";

    const user = await getUser(authorization);
    if (!user) throw "Unauthorized to perform this action";

    const category = new CategoryModel({ "category": name });
    await category.validate();
    await category.save();

    return "Created category";
};

export const getItems = async (authorization: string) => {
    const user = await getUser(authorization);
    if (!user) throw "Unauthorized to perform this action";
    return ItemModel.find({}).populate("category");
};

export const getCategories = async (authorization: string) => {
    const user = await getUser(authorization);
    if (!user) throw "Unauthorized to perform this action";
    return CategoryModel.find({}).populate("items");
};

export const getCategory = async (categoryID: ICategory["_id"], authorization: string) => {
    const user = await getUser(authorization);
    if (!user) throw "Unauthorized to perform this action";
    return CategoryModel.findById(categoryID).populate("items");
};

export const editCategoryName = async (categoryID: ICategory["_id"], newName: ICategory["category"], authorization: string) => {
    if (!await isAdmin(authorization)) throw "Unauthorized to perform this action";

    const user = await getUser(authorization);
    if (!user) throw "Unauthorized to perform this action";

    await CategoryModel.findByIdAndUpdate(categoryID, { "$set": { "category": newName } });
    return "Updated category name";
};

export const deleteCategory = async (categoryID: ICategory["_id"], authorization: string) => {
    if (!await isAdmin(authorization)) throw "Unauthorized to perform this action";

    const user = await getUser(authorization);
    if (!user) throw "Unauthorized to perform this action";

    await CategoryModel.findByIdAndRemove(categoryID);
    return "Deleted category";
};

export const createItem = async (
  categoryID: ICategory["_id"],
  itemName: IItem["name"],
  itemImage: IItem["image"],
  itemStock: IItem["stock"],
  authorization: string
) => {
    if (!await isAdmin(authorization)) throw "Unauthorized to perform this action";
    if (!itemImage) throw  "Item image is required";

    const user = await getUser(authorization);
    if (!user) throw "Unauthorized to perform this action";

    const item = await new ItemModel({
        "name": itemName,
        "image": itemImage,
        "category": categoryID,
        "stock": itemStock
    }).save();
    await CategoryModel.findByIdAndUpdate(categoryID, { "$addToSet": { "items": item._id } });

    return "Created item";
};

export const editItemName = async (itemID: IItem["_id"], newName: IItem["name"], authorization: string) => {
    if (!await isAdmin(authorization)) throw "Unauthorized to perform this action";

    const user = await getUser(authorization);
    if (!user) throw "Unauthorized to perform this action";

    await ItemModel.findByIdAndUpdate(itemID, { "$set": { "name": newName } });
    return "Updated item name";
};

export const editItemImage = async (itemID: IItem["_id"], newImage: IItem["image"], authorization: string) => {
    if (!await isAdmin(authorization)) throw "Unauthorized to perform this action";

    const user = await getUser(authorization);
    if (!user) throw "Unauthorized to perform this action";

    await ItemModel.findByIdAndUpdate(itemID, { "$set": { "image": newImage } });
    return "Update item image";
};

export const updateItemStock = async (itemID: IItem["_id"], stock: IItem["stock"], authorization: string) => {
    if (!await isAdmin(authorization)) throw "Unauthorized to perform this action";

    const user = await getUser(authorization);
    if (!user) throw "Unauthorized to perform this action";
    console.log(itemID);
    await ItemModel.findByIdAndUpdate(itemID, { "$set": { stock } });
    return "Updated item stock";
};

export const moveItem = async (itemID: IItem["_id"], newCategory: ICategory["_id"], authorization: string) => {
    if (!await isAdmin(authorization)) throw "Unauthorized to perform this action";

    const user = await getUser(authorization);
    if (!user) throw "Unauthorized to perform this action";

    const item = await ItemModel.findById(itemID);
    if (!item) throw "Item not found";
    if (item.category.toString() === newCategory) throw "Item already in this category";

    await CategoryModel.findByIdAndUpdate(item.category, { "$pull": { "items": item._id } });
    item.category = newCategory;
    await item.save();

    return "Moved category";
};

export const deleteItem = async (itemID: IItem["_id"], authorization: string) => {
    if (!await isAdmin(authorization)) throw "Unauthorized to perform this action";

    const user = await getUser(authorization);
    if (!user) throw "Unauthorized to perform this action";

    await ItemModel.findByIdAndRemove(itemID);
    return "Deleted item";
};

export const getOrders = async (authorization: string) => {
    const JWTPayload = <IUserJWTToken>jwt.verify(authorization, process.env.JWT_ENCRYPTION_SECRET as string);
    if (!JWTPayload.admin) throw "Unauthorized to perform this action";

    return OrderModel.find({})
      .populate("user", "firstName lastName")
      .populate({
          path: "items",
          populate: {
              path: "category"
          }
      })
      .exec();
}
