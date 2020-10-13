import { Document, DocumentQuery, Schema, Model, model, HookNextFunction } from "mongoose";
import isURL from "validator/lib/isURL";

export interface IItem extends Document {
    name: string;
    category: string;
    image: string;
    stock: number;
}

export interface IItemModel extends Model<IItem> {
    _id: Schema.Types.ObjectId;
    createdAt: Date;
    editedAt: Date;
}

export const userSchema =  new Schema({
    "name": {
        "type": String,
        "minlength": [3, "Must have at least more than three characters for item name"],
        "maxlength": [80, "Exceeded maximum length for item name"]
    },
    "category": {
        "type": String,
    }
}, {
    "timestamps": true,
});

userSchema.index({
    "email": -1,
    "phone": 1
});

// const queryHelpers  = {
//     byEmail: function(this: DocumentQuery<any, IUser>, email: IUser["email"]) {return this.find({ "email": decrypt(email) })},
//     byPhone: function(this: DocumentQuery<any, IUser>, phone: IUser["phone"]) {return this.find({ "phone": decrypt(phone) })}
// };

// userSchema.query = queryHelpers;


// userSchema.virtual("fullName")
//   .get(function(this: { firstName: IUser["firstName"], lastName: IUser["lastName"] }) {
//       return [this.firstName, this.lastName].join(" ");
//   })
//   .set(function(this: { firstName: IUser["firstName"], lastName: IUser["lastName"] }, v: string) {
//       this.firstName = v.substr(0, v.indexOf(' '));
//       this.lastName = v.substr(v.indexOf(' ') + 1);
//   });

// userSchema.methods.comparePassword = async function (password: IUser["password"]) {
//     return await compare(password, this.password)
// }
//
// userSchema.pre<IUser & IUserModel>("save", async function( next) {
//     if (!this.isModified("password") || !this.isModified("email") || !this.isModified("phone"))
//         return next();
//
//     if (this.isModified("password")) {}
//     if (this.isModified("email")) this.email = encrypt(this.email);
//     if (this.isModified("phone")) this.phone = encrypt(this.phone.toString());
//
//     return next();
// });
//
// async function updateDocument(this: any, next: HookNextFunction) {
//     const isModified = this._update.$set;
//     const docToUpdate = await this.model.findOne(this.getFilter());
//
//
//     try {
//
//     } catch (err) {
//         console.error(err);
//         next();
//     }
// }
//
// userSchema.pre<IUser & Document>("save", async function( next) {
//     if (!this.isModified("password"))
//         return next();
//
//     try {
//
//     } catch (err) {
//         console.error(err);
//         next(err);
//     }
// });
//
// userSchema.pre("update", updateDocument);
// userSchema.pre("updateOne", updateDocument);

export default model<IItem, IItemModel>("items", userSchema);
