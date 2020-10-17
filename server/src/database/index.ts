import mongoose from "mongoose";
import fs from "fs";
import path from "path";

mongoose.set("debug", process.env.NODE_ENV === "development");

export default mongoose.connect(process.env.MONGODB_CONNECTION as string, {
    "useNewUrlParser": true,
    "useUnifiedTopology": true,
    "useCreateIndex": true,
    "useFindAndModify": true,
    "poolSize": 30,
    "authSource": "admin",
    "autoIndex": true
})
  .catch(err => console.error("Database error", err.stack));

fs.readdir(path.resolve(__dirname, "models"), (err, files) => {
    if (err) return console.error(err);
    return files.forEach((file) =>  import(path.resolve(__dirname, "models", file)));
});
