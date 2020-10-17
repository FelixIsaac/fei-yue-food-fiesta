import CategoryModel, { ICategory } from "../../database/models/CategoryModel";
import ItemModel, { IItem } from "../../database/models/ItemModel";
import { getUser, isAdmin } from "../user/user-ctrl";

export const createCategory = async (name: ICategory["category"], authorization: string) => {
    if (!await isAdmin(authorization)) throw "Unauthorized to perform this action";

    const user = await getUser(authorization);
    if (!user) throw "Unauthorized to perform this action";

    const category = new CategoryModel({ "category": name });
    await category.validate();
    await category.save();

    return "Created category";
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

export const createItem = async (
  categoryID: ICategory["_id"],
  itemName: IItem["name"],
  itemImage: IItem["image"],
  authorization: string
) => {
    if (!await isAdmin(authorization)) throw "Unauthorized to perform this action";
    if (!itemImage) throw  "Item image is required";

    const user =  await getUser(authorization);
    if (!user) throw "Unauthorized to perform this action";

    await CategoryModel.findByIdAndUpdate(categoryID, {
        "$addToSet": {
             // @ts-ignore
            "items": {
                "name": itemName,
                "image": itemImage
            }
        }
    });

    return "Created item";
};

export const editCategoryName = async (categoryID: ICategory["_id"], newName: ICategory["category"], authorization: string) => {
    if (!await isAdmin(authorization)) throw "Unauthorized to perform this action";

    const user =  await getUser(authorization);
    if (!user) throw "Unauthorized to perform this action";

    await CategoryModel.findOneAndUpdate(categoryID, {
        "$set": {
            "category": newName
        }
    });

    return "Updated category name";
};

export const editItemName = async (itemID: IItem["_id"], newName: IItem["name"], authorization: string) => {
    if (!await isAdmin(authorization)) throw "Unauthorized to perform this action";

    const user =  await getUser(authorization);
    if (!user) throw "Unauthorized to perform this action";

    await CategoryModel.findOneAndUpdate({
        "items._id": itemID
    }, {
        "$set": {
            "items.$.name": newName
        }
    });

    return "Updated item name";
};

export const editItemImage = async (itemID: IItem["_id"], newImage: IItem["image"], authorization: string) => {
    if (!await isAdmin(authorization)) throw "Unauthorized to perform this action";

    const user =  await getUser(authorization);
    if (!user) throw "Unauthorized to perform this action";

    await CategoryModel.findOneAndUpdate({
        "items._id": itemID
    }, {
        "$set": {
            "items.$.image": newImage
        }
    });

    return "Update item image";
};

export const updateItemStock = async (itemID: IItem["_id"], stock: IItem["stock"], authorization: string) => {
    if (!await isAdmin(authorization)) throw "Unauthorized to perform this action";

    const user =  await getUser(authorization);
    if (!user) throw "Unauthorized to perform this action";

    await CategoryModel.findOneAndUpdate({
        "items._id": itemID
    }, {
        "$set": {
            "items.$.stock": stock
        }
    });

    return "Updated item stock";
};
