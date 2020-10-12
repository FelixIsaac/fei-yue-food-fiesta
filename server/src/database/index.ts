import mongoose from "mongoose";
import fs from "fs";
import path from "path";

export default mongoose.connect("mongodb://localhost:27017/feiyue", {
    "useNewUrlParser": true,
    "useUnifiedTopology": true,
    "useCreateIndex": true,
    "poolSize": 5000,
    "authSource": "admin",
    "autoIndex": true
})
  .catch(err => console.error("Database error", err.stack));

fs.readdir(path.resolve("models"), (err, files) => {
    if (err) return process.exit(1) && console.error(err);
    return files.forEach((file) => import(path.resolve("models", file)));
});
