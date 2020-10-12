import { Document, DocumentQuery, Schema, Model, model, HookNextFunction } from "mongoose";
import isEmail from "validator/lib/isEmail";
import isMobilePhone  from "validator/lib/isMobilePhone";
import { compare, hash } from "bcrypt";
import zxcvbn from "zxcvbn";

export interface IUser extends Document {
    username: string;
    avatar: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: number;
    password: string;
}

export interface IUserModel extends Model<IUser, typeof queryHelpers> {
    fullName: string;
    byEmail(email: IUser["email"]): IUser | null;
    byPhone(phone: IUser["phone"]): IUser | null;
    comparePassword(password: IUser["password"]): boolean;
    _id: Schema.Types.ObjectId;
    createdAt: Date;
    editedAt: Date;
}

export const userSchema =  new Schema({
    "username": {
        "type": String,
        "minlength": [3, "Username length cannot be lower than 3"],
        "maxlength": [32, "Username length cannot be higher than 32"]
    },
    "avatar": String,
    "firstName": { "type": String, "required": [true, "Missing first name"] },
    "lastName": String,
    "admin": {
        "type": Boolean,
        "default": false
    },
    "email": {
        "type": String,
        "validate": {
            "validator": isEmail,
            "message": "Invalid email address"
        },
        "required": [true, "Email address is necessary for account creation"],
        "unique": [true, "This email address is already associated with another account"],
    },
    "phone": {
        "type": Number,
        "validate": {
            "validator": (phone: IUser["phone"]) => isMobilePhone(phone.toString(), "en-SG"),
            "message": "Invalid phone number"
        },
        "required": [true, "Phone number is necessary for account creation"],
        "unique": [true, "This number is already associated with another account"]
    },
    "password": {
        "type": String,
        "validator": {
            "validator": "",
            "message": "Password is insecure"
        },
        "required": [true, "Password is required for account creation"]
    },
    "items": {
        "type": Array,
        "default": []
    },
    "history": {
        "type": Array,
        "default": []
    }
}, {
    "timestamps": true,
});

const queryHelpers  = {
    byEmail: function(this: DocumentQuery<any, IUser>, email: IUser["email"]) {return this.find({ email })},
    byPhone: function(this: DocumentQuery<any, IUser>, phone: IUser["phone"]) {return this.find({ phone })}
};

userSchema.query = queryHelpers;

userSchema.index({
    "email": -1,
    "phone": 1
});

userSchema.virtual("fullName")
  .get(function(this: { firstName: IUser["firstName"], lastName: IUser["lastName"] }) {
      return [this.firstName, this.lastName].join(" ");
  })
  .set(function(this: { firstName: IUser["firstName"], lastName: IUser["lastName"] }, v: string) {
      this.firstName = v.substr(0, v.indexOf(' '));
      this.lastName = v.substr(v.indexOf(' ') + 1);
  });

userSchema.methods.comparePassword = function (password: IUser["password"]) {
    return compare(password, this.password)
}

const validatePassword  = (password: IUser["password"], user_inputs: string[] = [], next: HookNextFunction) => {
    try {
        if (
          !/(?=^.{8,}$)(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&amp;*()_+}{&quot;:;'?/&gt;.&lt;,])(?!.*\s).*$/
            .test(password)
        ) throw new Error("Password must be at 8 characters or above and include at least one; " +
        "uppercase, lowercase, digit, symbol/special character");

        const { score, feedback: { warning, suggestions } } = zxcvbn(password, user_inputs);
        const feedback = `${warning || suggestions.length ? `:\n${warning ? warning : ""}\n${suggestions.join("\n")}` : ""}`;

        if (score < 3) throw new Error(`Password is too weak\n${feedback}`);
        if (warning) throw new Error(`Password warning:\n${feedback}`);
    } catch (err) {
        next(err);
    }
};

userSchema.pre<IUser & IUserModel>("save", async function( next) {
    if (!this.isModified("password") || !this.isModified("email") || !this.isModified("phone"))
        return next();

    if (this.isModified("password")) {
        const blacklist = [this.username, this.firstName, this.lastName, this.fullName, decrypt(this.email)]
        validatePassword(this.password, blacklist, next);
        this.password = await hash(this.password, 12)
    }

    if (this.isModified("email")) this.email = encrypt(this.email);
    if (this.isModified("phone")) this.phone = encrypt(this.phone);

    return next();
});

// async function updateDocument(this: any, next: HookNextFunction) {}
//
// userSchema.pre<IUserModel>("save", async function( next) {
//     if (!this.isModified("password"))
//         return next();
//
//     try {
//         // Check if quality of password is passable
//
//         validatePassword(this.password, [this.username, decrypt(this.email)], next);
//         this.password = hashSync(`${this.username}:::${this.email}:::${this.password}`, 12);
//
//         next();
//         // TODO: Potential todo, verification email -- Necessary?
//         // this.verifiedEmail = false;
//     } catch (err) {
//         console.error(err);
//         next(err);
//     }
// });
//
// userSchema.pre("update", updateDocument);
// userSchema.pre("updateOne", updateDocument);

export default model<IUser, IUserModel>("users", userSchema);
