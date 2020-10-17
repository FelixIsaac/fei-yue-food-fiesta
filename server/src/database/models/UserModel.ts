import { Document, DocumentQuery, Schema, Model, model, HookNextFunction } from "mongoose";
import isEmail from "validator/lib/isEmail";
import isMobilePhone  from "validator/lib/isMobilePhone";
import isURL from "validator/lib/isURL";
import { compare, hash } from "bcrypt";
import uniqueValidator from "mongoose-unique-validator";
import { decrypt, encrypt } from "../../utils/encryption";
import zxcvbn from "zxcvbn";

export interface IUser extends Document {
    avatar: string;
    firstName: string;
    lastName: string;
    admin: boolean;
    email: string;
    phone: string;
    password: string;
    items: Schema.Types.ObjectId[];
    history: string[][];
}

export interface IUserModel extends Model<IUser, typeof queryHelpers> {
    fullName: string;
    comparePassword(password: IUser["password"]): boolean;
    _id: Schema.Types.ObjectId;
    createdAt: Date;
    editedAt: Date;
}

export interface IUserJWTToken {
    fullName: IUserModel["fullName"];
    admin: IUser["admin"];
    userID: IUserModel["_id"]
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

export const userSchema =  new Schema({
    "avatar": {
        "type": String,
        "validate": {
            "validator": isURL,
            "message": "Invalid avatar URL"
        }
    },
    "firstName": { "type": String, "required": [true, "Missing first name"] },
    "lastName": String,
    "admin": {
        "type": Boolean,
        "default": false
    },
    "email": {
        "type": String,
        "validate": {
            "validator": (email: string) => isEmail(email) || isEmail(decrypt(email)),
            "message": "Invalid email address"
        },
        "required": [true, "Email address is necessary for account creation"],
        "unique": [true, "This email address is already associated with another account"],
    },
    "phone": {
        "type": String,
        "validate": {
            "validator": (phone: IUser["phone"]) => isMobilePhone(phone, "en-SG") || isMobilePhone(decrypt(phone)),
            "message": "Invalid phone number"
        },
        "required": [true, "Phone number is necessary for account creation"],
        "unique": [true, "This number is already associated with another account"]
    },
    "password": {
        "type": String,
        "validator": {
            "validate": validatePassword,
            "message": "Password is insecure"
        },
        "required": [true, "Password is required for account creation"]
    },
    "items": {
        "type": [Schema.Types.ObjectId],
        "validate": {
            "validator": (items: IUser["items"]) => items.length <= 3,
            "message": "Cannot select more than three items"
        },
        "default": []
    },
    "history": {
        "type": [[String]],
        "default": []
    }
}, {
    "timestamps": true,
});

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

userSchema.methods.comparePassword = async function (password: IUser["password"]) {
    return await compare(password, this.password)
}

userSchema.pre<IUser & IUserModel>("save", async function( next) {
    if (this.isModified("password")) {
        validatePassword(
          this.password,
          [this.firstName, this.lastName, this.fullName, this.email],
          next
        );

        this.password = await hash(this.password, 16);
    }

    if (this.isModified("email")) this.email = encrypt(this.email);
    if (this.isModified("phone")) this.phone = encrypt(this.phone);

    // TODO: send verification mail to  email -- Necessary?
});

async function updateDocument(this: any, next: HookNextFunction) {
    console.log(2);
    // const isModified = this._update.$set;
    // // ! use getFilter instead of getQuery
    // const docToUpdate = await this.model.findOne(this.getFilter());
    //
    // if (!isModified.password || !isModified.email || !isModified.phone) return next();
    //
    // try {
    //     if (isModified.password) {
    //         validatePassword(
    //           isModified.password,
    //           [this.firstName, this.lastName, this.fullName, decrypt(this.email)],
    //           next
    //         );
    //
    //         isModified.password = await hash(isModified.password, 16);
    //     }
    //
    //     if (isModified.email) isModified.email = encrypt(isModified.email);
    //     if (isModified.phone) isModified.phone = encrypt(isModified.phone);
    //
    //     return next();
    // } catch (err) {
    //     console.error(err);
    //     return next();
    // }
}

const queryHelpers  = {
    byEmail: function(this: DocumentQuery<any, IUser>, email: IUser["email"]) {return this.find({ "email": email })},
    byPhone: function(this: DocumentQuery<any, IUser>, phone: IUser["phone"]) {return this.where({ "phone": phone })},
    byEmailOrPhone: function(this: DocumentQuery<any, IUser>, emailOrPhone: IUser["email"] | IUser["phone"]) {
        return this.where({ "$or": [{ "email": encrypt(emailOrPhone) }, { "phone": encrypt(emailOrPhone) }] });
    }
};

userSchema.query = queryHelpers;

userSchema.pre("update", updateDocument);
userSchema.pre("updateOne", updateDocument);
userSchema.plugin(uniqueValidator, { "message": "There's already an account registered with that {PATH}" });

export default model<IUser, IUserModel>("users", userSchema);
