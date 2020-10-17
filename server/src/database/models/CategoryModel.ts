import { Document, Schema, model } from "mongoose";
import uniqueValidator from "mongoose-unique-validator";
import isURL from "validator/lib/isURL";
import { userSchema } from "./UserModel";

export interface IItem extends Document{
    name: string;
    image: string;
    stock: number;
}

export interface ICategory extends Document {
    category: string;
    items: IItem[];
}

export interface ICategoryModel extends ICategory {
    _id: Schema.Types.ObjectId;
    id: Schema.Types.ObjectId;
    createdAt: Date;
    editedAt: Date;
}

export const categorySchema =  new Schema({
    "category": {
        "type": String,
        "required": [true, "Category name required"],
        "unique": true,
        "uniqueCaseInsensitive": true,
        "minlength": [3, "Must have at least more than three characters for category name"],
        "maxlength": [80, "Exceeded maximum length for category name"]
    },
    "items": {
        "type": [{
            "name": {
                "type": String,
                "required": [true, "Item name required"],
                "unique": true,
                "uniqueCaseInsensitive": true,
                "minlength": [3, "Must have at least more than three characters for item name"],
                "maxlength": [80, "Exceeded maximum length for item name"]
            },
            "image": {
                "type": String,
                "validate": {
                    "validator": isURL,
                    "message": "Item image is not a valid URL"
                },
                "required": [true, "Image is required for this item"]
            },
            "stock": {
                "type": Number,
                "default": 0,
                "min": [0, "Cannot have less than zero of this item"]
            }
        }],
        "unique": true
    }
}, {
    "timestamps": true,
});

categorySchema.index({ "category": -1, "items.name": 1 });
categorySchema.plugin(uniqueValidator, { "message": "There's already a category/item registered with that {PATH}" });
export default model<ICategoryModel>("items", categorySchema);
