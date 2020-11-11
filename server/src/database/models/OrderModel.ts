import { Document, model, Schema } from "mongoose";
import uniqueValidator from "mongoose-unique-validator";
import { IUserDocument } from "./UserModel";

export interface IOrder {
    userID: IUserDocument["_id"];
    items: Schema.Types.ObjectId[]
}

export interface IOrderDocument extends IOrder, Document {
    _id: Schema.Types.ObjectId;
    createdAt: Date;
    editedAt: Date;
}

export const orderSchema = new Schema({
    "user": {
        "type": Schema.Types.ObjectId,
        "required": [true, "User ID required"],
        "unique": true,
        "ref": "users"
    },
    "items": [{
        "type": Schema.Types.ObjectId,
        "required": [true, "Items required"],
        "ref": "items"
    }]
}, {
    "timestamps": true
});

orderSchema.index({ "userID": 1 });
orderSchema.plugin(uniqueValidator, { "message": "There's already a item registered with that {PATH}" });
export default model<IOrderDocument>("orders", orderSchema);
