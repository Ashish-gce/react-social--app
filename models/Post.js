const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    //  who is the user, who made the post.
    user: {
      // "user" -> show the connection b/w User table and Post table
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    // _id: { type: String, required: true },
    text: { type: String, required: true },
    image: { type: String, required: true },
    name: { type: String, required: true },
    avatar: { type: String, required: true },
    likes: [
      // likes "date" maintaining is not required
      // an array and it maintain the list of users data (this comes from "users" users table)
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "user" }, // it means who made our like.  Therefor, one user only-one like will get count.
      },
    ],
    comments: [
      // its also an array b'z we've to maintain   "multiple comments"
      {
        // each comment is an object
        user: { type: mongoose.Schema.Types.ObjectId, ref: "user" }, // who is the user made this comment
        text: { type: String }, // "required" is not required
        name: { type: String },
        avatar: { type: String },
        //  //  📅  📅  type: Date, default: Date.now()  -> current date 📅  📅  //  //
        date: { type: Date, default: Date.now() }, // it maintain the comments creation date specially -> after/later post created
      },
    ],
  },
  { timestamps: true } // it maintain the post created date automatically
);

// here we're creating and exporting post schema
const Post = mongoose.model("post", PostSchema); // .model('post' -> is the table name)
module.exports = Post;
