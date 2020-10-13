import { Document, DocumentQuery, Schema, Model, model, HookNextFunction } from "mongoose";
import isEmail from "validator/lib/isEmail";
import isMobilePhone  from "validator/lib/isMobilePhone";
import isURL from "validator/lib/isURL";
import { compare, hash } from "bcrypt";
import { encryption as encrypt, decryption as decrypt } from "../../utils/encryption";
import zxcvbn from "zxcvbn";

export interface IUser extends Document {
    username: string;
    avatar: string;
    firstName: string;
    lastName: string;
    admin: boolean;
    email: string;
    phone: string;
    password: string;
}

export interface IUserModel extends Model<IUser, typeof queryHelpers> {
    fullName: string;
    comparePassword(password: IUser["password"]): boolean;
    _id: Schema.Types.ObjectId;
    createdAt: Date;
    editedAt: Date;
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
    "username": {
        "type": String,
        "minlength": [3, "Username length cannot be lower than 3"],
        "maxlength": [32, "Username length cannot be higher than 32"]
    },
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
            "validator": isEmail,
            "message": "Invalid email address"
        },
        "required": [true, "Email address is necessary for account creation"],
        "unique": [true, "This email address is already associated with another account"],
    },
    "phone": {
        "type": String,
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
            "validator": validatePassword,
            "message": "Password is insecure"
        },
        "required": [true, "Password is required for account creation"]
    },
    "items": {
        "type": [String],
        "default": []
    },
    "history": {
        "type": Array,
        "default": [[String]]
    }
}, {
    "timestamps": true,
});

const queryHelpers  = {
    byEmail: function(this: DocumentQuery<any, IUser>, email: IUser["email"]) {return this.find({ "email": encrypt(email) })},
    byPhone: function(this: DocumentQuery<any, IUser>, phone: IUser["phone"]) {return this.find({ "phone": encrypt(phone) })},
    byEmailOrPhone: function(this: DocumentQuery<any, IUser>, emailOrPhone: IUser["email"] | IUser["phone"]) {
        return this.find({
            "$or": [{
                "email": encrypt(emailOrPhone)
            }, {
                "phone": encrypt(emailOrPhone)
            }]
        });
    }
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

userSchema.methods.comparePassword = async function (password: IUser["password"]) {
    return await compare(password, this.password)
}

userSchema.pre<IUser & IUserModel>("save", async function( next) {
    if (!this.isModified("password") || !this.isModified("email") || !this.isModified("phone"))
        return next();

    if (this.isModified("password")) {
        validatePassword(
          this.password,
          [this.username, this.firstName, this.lastName, this.fullName, decrypt(this.email)],
          next
        );

        this.password = await hash(this.password, 16)
    }

    if (this.isModified("email")) this.email = encrypt(this.email);
    if (this.isModified("phone")) this.phone = encrypt(this.phone.toString());

    return next();
});

async function updateDocument(this: any, next: HookNextFunction) {
    const isModified = this._update.$set;
    // ! use getFilter instead of getQuery
    const docToUpdate = await this.model.findOne(this.getFilter());

    if (!isModified.password || !isModified.email || !isModified.phone) return next();

    try {
        if (isModified.password) {
            validatePassword(
              isModified.password,
              [this.username, this.firstName, this.lastName, this.fullName, decrypt(this.email)],
              next
            );

            isModified.password = await hash(isModified.password, 16);
        }

        if (isModified.email) isModified.email = encrypt(isModified.email);
        if (isModified.phone) isModified.phone = encrypt(isModified.phone);
    } catch (err) {
        console.error(err);
        next();
    }
}

userSchema.pre<IUser & Document>("save", async function( next) {
    if (!this.isModified("password"))
        return next();

    try {
        // Check if quality of password is passable

        validatePassword(this.password, [this.username, decrypt(this.email)], next);
        this.password = await hash(this.password, 16);

        next();
        // TODO: Potential todo, verification email -- Necessary?
        // this.verifiedEmail = false;
    } catch (err) {
        console.error(err);
        next(err);
    }
});

userSchema.pre("update", updateDocument);
userSchema.pre("updateOne", updateDocument);

export default model<IUser, IUserModel>("users", userSchema);
