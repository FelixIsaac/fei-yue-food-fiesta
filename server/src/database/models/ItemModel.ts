import { Document, model, Schema } from "mongoose";
import uniqueValidator from "mongoose-unique-validator";
import isURL from "validator/lib/isURL";
import { ICategory, ICategoryModel } from "./CategoryModel";

export interface IItem extends Document {
    name: string;
    image: string;
    stock: number;
    category: Schema.Types.ObjectId | ICategory
}

export const itemSchema = new Schema({
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
    },
    "category": {
        "type": Schema.Types.ObjectId,
        "ref": "categories"
    }
}, {
    "timestamps": true
});

itemSchema.index({ "name": 1 });
itemSchema.plugin(uniqueValidator, { "message": "There's already a item registered with that {PATH}" });
export default model<ICategoryModel>("items", itemSchema);
