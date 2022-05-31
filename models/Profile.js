const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema(
  {
    user: {
      // "user" -> show the connection b/w  User table   and  Profile table
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    company: { type: String, required: true },
    website: { type: String, required: true },
    location: { type: String, required: true },
    designation: { type: String, required: true },
    skills: { type: [String], required: true }, // [String] -> b'z we've more then one skills to store them in Array
    bio: { type: String, required: true },
    githubusername: { type: String, required: true },
    experience: [
      // [experience] -> is an array of objects, b'z employees have multiple experience
      {
        title: { type: String },
        company: { type: String },
        location: { type: String },
        from: { type: String },
        to: { type: String },
        current: { type: Boolean }, // current is 'boolean' (true or false) -> b'z working in company or not
        description: { type: String },
      },
    ],
    education: [
      // [education] -> is also an array of objects, b'z of different education level
      {
        school: { type: String },
        degree: { type: String },
        fieldOfStudy: { type: String },
        from: { type: String },
        to: { type: String },
        current: { type: Boolean }, // current is 'boolean' (true or false) -> b'z working in company or not
        description: { type: String },
      },
    ],
    social: {
      youtube: { type: String, required: true },
      facebook: { type: String, required: true },
      twitter: { type: String, required: true },
      linkedin: { type: String, required: true },
      instagram: { type: String, required: true },
    },
  },
  { timestamps: true }
);

// here we're creating profile schema
const Profile = mongoose.model("profile", ProfileSchema); // .model('profile' -> is the table name)
module.exports = Profile;
