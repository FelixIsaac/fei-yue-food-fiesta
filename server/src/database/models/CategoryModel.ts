import { Document, model, Schema } from "mongoose";
import uniqueValidator from "mongoose-unique-validator";
import { IItem } from "./ItemModel";

export interface ICategory extends Document {
    category: string;
    items: Schema.Types.ObjectId[] | IItem[];
}

export interface ICategoryModel extends ICategory {
    _id: Schema.Types.ObjectId;
    id: Schema.Types.ObjectId;
    createdAt: Date;
    editedAt: Date;
}

export const categorySchema = new Schema({
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
            "type": Schema.Types.ObjectId,
            "ref": "items"
        }],
        "unique": true
    }
}, {
    "timestamps": true,
});

categorySchema.index({ "category": 1 });
categorySchema.plugin(uniqueValidator, { "message": "There's already a category registered with that {PATH}" });
export default model<ICategoryModel>("categories", categorySchema);
