import CategoryModel, { IItem, ICategory, ICategoryModel } from "../../database/models/CategoryModel";
import { getUser, isAdmin } from "../user/user-ctrl";

export const createCategory = async (name: ICategory["category"], authorization: string) => {
    if (!await isAdmin(authorization)) throw "Unauthorized to perform this action";

    const user =  await getUser(authorization);
    if (!user) throw "Unauthorized to perform this action";

    const category = new CategoryModel({ "category": name });
    await category.validate();
    await category.save();

    return "Created category";
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

