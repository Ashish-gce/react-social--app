const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true }, // email should "unique"
    password: { type: String, required: true },
    isAdmin: { type: Boolean, required: true, default: false }, // default "isAdmin : false" -> b'z bydefault not any user access Admin page -> access after login
    avatar: { type: String, required: true },
  },
  { timestamps: true }
); // "timestamp : true" -> to keep track of all updation like:- date, time, ...

const User = mongoose.model("user", UserSchema); // "user" -> Table name
module.exports = User;
