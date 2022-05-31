// //  🚀 🚀  🚀  🚀  REST API server Configuration  🚀  🚀  🚀

const express = require("express");
const router = express.Router(); // "Router()" -> predefined function in express
const Profile = require("../models/Profile");
const User = require("../models/User"); // to remove/delete particular user's table in "DELETE" operation
const authenticate = require("../middlewares/authenticate"); // for 'Token' authentication purpose  b'z of PRIVATE route
const { body, validationResult } = require("express-validator"); //for form validation

//  @ If I have my aprofile then display -> Edit-profile button,  otherwise  show the option of  'create a profile' button
/*  1.
    @usage: Get a profile  or  get my profile
    @url: /api/profiles/me
    @fields: no-fields required
    @method: GET
    @access: PRIVATE  // every PRIVATE request needs "authenticate" to verify
*/

// To get any profile, since every profile has its on profile-id / primary key.  So we need to provide them
router.get(
  "/me",
  // before 'request' and 'response' we need to verify/authenticate the "Token"
  authenticate,
  async (request, response) => {
    try {
      //  to get logged person user 'id' -> 1st we need to authenticate the "Token" -> it contains user-id
      //  "user" -> show the connection b/w 'User table' and 'Profile table' -> it contains logged -in person user-id
      //  "request.user.id" -> for this particular userid we get thats profile
      let profile = await Profile.findOne({ user: request.user.id }).populate(
        "user", // from 'user' table we populate "name" and "avatar"
        ["name", "avatar"]
      );

      if (!profile) {
        return response
          .status(400)
          .json({ errors: [{ message: "No profile found." }] });
      }

      // "profile" found -> then send it to the client
      response.status(200).json({ profile: profile });
    } catch (error) {
      console.error(error);
      response.status(500).json({ error: [{ msg: error.message }] });
    }
  }
);

//  NOTE:- Only "Login" people can create profile
/* 2.
    @usage: Create a profile
    @url: /api/profiles/
    @fields: company , website , location , designation , skills , bio , githubUsername, youtube , facebook , twitter , linkedin , instagram
    @method: POST
    @access: PRIVATE  // every PRIVATE request needs "authenticate" to verify
*/
router.post(
  "/",
  [
    // perform form validation / check validation
    body("company").notEmpty().withMessage("Company is required"),
    body("website").notEmpty().withMessage("Website is required"),
    body("location").notEmpty().withMessage("Location is required"),
    body("designation").notEmpty().withMessage("Designation is required"),
    body("skills").notEmpty().withMessage("Skills is required"),
    body("bio").notEmpty().withMessage("Bio/Biography is required"),
    body("githubusername").notEmpty().withMessage("GitbubUserName is required"),
    body("youtube").notEmpty().withMessage("Youtube is required"),
    body("facebook").notEmpty().withMessage("Facebook is required"),
    body("twitter").notEmpty().withMessage("Twitter is required"),
    body("linkedin").notEmpty().withMessage("LinkedIn is required"),
    body("instagram").notEmpty().withMessage("Instagram is required"),
  ],

  // perform "Token" authentication
  authenticate,
  async (request, response) => {
    let error = validationResult(request);
    if (!error.isEmpty()) {
      return response.status(401).json({ error: error.array() }); // 401 -> unauthorized error
    }
    try {
      // get all the fields from the form body
      let {
        company,
        website,
        location,
        designation,
        skills,
        bio,
        githubusername,
        youtube,
        facebook,
        linkedin,
        twitter,
        instagram,
      } = request.body;

      let profileObj = {}; // create an empty object to store form data
      profileObj.user = request.user.id; // "id" gets from form Token
      //   below assign data we receive from form.
      if (company) profileObj.company = company;
      if (website) profileObj.website = website;
      if (location) profileObj.location = location;
      if (designation) profileObj.designation = designation;

      if (skills)
        profileObj.skills = skills
          .toString() // each data converted into "String"  ex- "html, css, js, java, reactjs" -> "html", "css", "js", "java", "react"
          .split(",")
          .map((skill) => skill.trim()); // trim() method removes space even under String which is seperated by comma ( ,  ,  ,   ,)
      if (bio) profileObj.bio = bio;
      if (githubusername) profileObj.githubusername = githubusername;

      profileObj.social = {}; // create "social" nested object under 'profileObj'
      if (youtube) profileObj.social.youtube = youtube;
      if (facebook) profileObj.social.facebook = facebook;
      if (linkedin) profileObj.social.linkedin = linkedin;
      if (twitter) profileObj.social.twitter = twitter;
      if (instagram) profileObj.social.instagram = instagram;

      //   insert to db
      let profile = new Profile(profileObj);
      profile = await profile.save();
      response
        .status(200)
        .json({ msg: "profile is ceated successfully", profile: profile });
    } catch (error) {
      console.error(error);
      response.status(500).json({ error: [{ msg: error.message }] });
    }
  }
);

/*  3. 
    @usage: Update profile
    @url: api/profiles/
    @fields: company , website , location , designation , skills , bio , githubUsername, youtube , facebook , twitter , linkedin , instagram
    @method: PUT
    @access: PRIVATE  // every PRIVATE request needs "authenticate" to verify
*/
router.put(
  "/",
  // perform form validation / check validation
  body("company").notEmpty().withMessage("Company is required"),
  body("website").notEmpty().withMessage("Website is required"),
  body("location").notEmpty().withMessage("Location is required"),
  body("designation").notEmpty().withMessage("Designation is required"),
  body("skills").notEmpty().withMessage("Skills is required"),
  body("bio").notEmpty().withMessage("Bio/Biography is required"),
  body("githubusername").notEmpty().withMessage("GitbubUserName is required"),
  body("youtube").notEmpty().withMessage("Youtube is required"),
  body("facebook").notEmpty().withMessage("Facebook is required"),
  body("twitter").notEmpty().withMessage("Twitter is required"),
  body("linkedin").notEmpty().withMessage("LinkedIn is required"),
  body("instagram").notEmpty().withMessage("Instagram is required"),

  // perform "Token" authentication
  authenticate,
  async (request, response) => {
    let error = validationResult(request);
    if (!error.isEmpty()) {
      return response.status(401).json({ error: error.array() }); // 401 -> unauthorized error
    }
    try {
      // get all the fields from the form body
      let {
        company,
        website,
        location,
        designation,
        skills,
        bio,
        githubusername,
        youtube,
        facebook,
        linkedin,
        twitter,
        instagram,
      } = request.body;

      // check if profile exists   HOW we can check if profile exists?  b'z we don't provide any "id" to update ?  Then HOW ? HOW ? HOW ? HOW ? HOW ? HOW ?
      // by the help of Token -> it contains user itself
      let profile = await Profile.findOne({ user: request.user.id }); // findOne() -> b'z we find by users  NOT by directly id.  findById() -> to search directly by id
      if (!profile) {
        return response
          .status(401)
          .json({ error: [{ msg: "No Profile Found" }] });
      }

      // 👍  👍  👍  if profile found then we can update the form  👍  👍  👍
      let profileObj = {}; // create an empty object to stote form data
      profileObj.user = request.user.id; // "id" gets from form Token
      //   below assign data we receive from form.
      if (company) profileObj.company = company;
      if (website) profileObj.website = website;
      if (location) profileObj.location = location;
      if (designation) profileObj.designation = designation;

      if (skills)
        profileObj.skills = skills
          .toString() // each data converted into "String"  ex- "html, css, js, java, reactjs" -> "html", "css", "js", "java", "react"
          .split(",")
          .map((skill) => skill.trim()); // trim() method removes space even under String which is seperated by comma ( ,  ,  ,   ,)
      if (bio) profileObj.bio = bio;
      if (githubusername) profileObj.githubusername = githubusername;

      profileObj.social = {}; // create "social" nested object under 'profileObj'
      if (youtube) profileObj.social.youtube = youtube;
      if (facebook) profileObj.social.facebook = facebook;
      if (linkedin) profileObj.social.linkedin = linkedin;
      if (twitter) profileObj.social.twitter = twitter;
      if (instagram) profileObj.social.instagram = instagram;

      //   update to db
      profile = await Profile.findOneAndUpdate(
        { user: request.user.id },
        {
          $set: profileObj, // for update data in the database
        },
        { new: true }
      );
      response
        .status(200)
        .json({ msg: "profile is updated successfully", profile: profile }); // we get 'profile' -> we get 'object' in response after updating
    } catch (error) {
      console.error(error);
      response.status(500).json({ error: [{ msg: error.message }] });
    }
  }
);

/*  4. 
    @usage: Get profile of a specific user
    @url: api/profiles/users/:userId      //  "userId" getting from url itself
    @fields: no fields
    @method: GET
    @access: PUBLIC  // anyone can access their own profile -> NO authentication required / NO verification required
*/
router.get("/users/:userId", async (request, response) => {
  try {
    // getting "userId" from url
    let userId = request.params.userId; // getting "userId" from url/parameter and store them local storage
    let profile = await Profile.findOne({ user: userId }).populate("user", [
      "name",
      "avatar",
    ]);
    if (!profile) {
      return response
        .status(400)
        .json({ error: [{ message: "No Profile Found for this User" }] });
    }
    response.status(200).json({ profile: profile });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: [{ msg: error.message }] });
  }
});

/*  5.
    @usage: Delete a profile, userInfo, posts or a user
    @url: api/profiles/users/:userId      //  "userId" getting from url itself
    @fields: no fields
    @method: DELETE
    @access: PRIVATE  // only that particular user/person can delete his own profile not other one.
*/
router.delete("/users/:userId", authenticate, async (request, response) => {
  try {
    let userId = request.params.userId;
    let profile = await Profile.findOne({ user: userId }); // here we get the profile from db
    // if profile is not found
    if (!profile) {
      return response
        .status(400)
        .json({ error: [{ message: "No Profile Found for this User" }] });
    }
    // delete the profile
    profile = await profile.deleteOne({ user: userId }); // deleted profile

    // check if exists
    let user = await User.findOne({ _id: userId });

    // if user is not found
    if (!user) {
      return response
        .status(400)
        .json({ error: [{ message: "No User Found" }] });
    }

    // check if user exists  and then delete the user
    await User.deleteOne({ user: userId }); // delete user itself

    // TODO delete the post of a user

    response.status(200).json({ msg: "Account id Deleted" });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: [{ msg: error.message }] });
  }
});

/*  6. 
    @usage: Add Experience in the profile
    @url: api/profiles/experience/
    @fields: title, company, location, from, to, current, description
    @method: PUT
    @access: PRIVATE  // only that particular user/person can UPDATE his own profile not other one.
*/
router.put(
  "/experience",
  // perform form validation
  [
    body("title").notEmpty().withMessage("Title is Required"),
    body("company").notEmpty().withMessage("Company is Required"),
    body("location").notEmpty().withMessage("Location is Required"),
    body("from").notEmpty().withMessage("From is Required"),
    body("description").notEmpty().withMessage("Description is Required"),
  ],
  authenticate,
  async (request, response) => {
    let errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(401).json({ errors: errors.array() });
    }

    // after validation successful
    try {
      // receiving form data
      let { title, company, location, from, to, current, description } =
        request.body;

      // now fill the 'Experience' object
      let newExperience = {
        title: title,
        company: company,
        location: location,
        from: from,
        description: description,
        to: to ? to : " ",
        current: current ? current : false,
      };
      // get profile of a user
      let profile = await Profile.findOne({ user: request.user.id }); // we get userId after ecoding the "Token"

      // check profile is exist or not
      if (!profile) {
        return response
          .status(400)
          .json({ errors: [{ msg: "No Profile is found" }] });
      }

      //  After profile is find then we add them
      // since 'experience' is an array, therefor adding object to an array -> 1. push() 2. unshift()
      profile.experience.unshift(newExperience); // unshift() -> add data in front
      profile = await profile.save();
      response.status(200).json({ profile: profile }); //  "profile: profile" -> this profile we add in local-redux store
    } catch (error) {
      console.error(error);
      response.status(500).json({ error: [{ msg: error.message }] });
    }
  }
);

/*  7. 
    @usage: Delete an experience of a profile
    @url: api/profiles/experience/:expId
    @fields: no fields
    @method: DELETE
    @access: PRIVATE  // only logged in people do this request
 */
router.delete(
  "/experience/:experienceId",
  authenticate,
  async (request, response) => {
    try {
      //  getting experience id from Token
      let experienceId = request.params.experienceId;

      console.log("88888888888888888888888888888888888888888888888");
      console.log(experienceId);

      //  before deleting profile experience we need to check them exist or nor
      let profile = await Profile.findOne({ user: request.user.id });

      console.log(
        "---------------------------------------------------------------------------"
      );
      console.log(profile);

      if (!profile) {
        return response
          .status(400)
          .json({ error: [{ msg: "no Profile Experience is Found" }] });
      }

      // once we get the profile then we delete them -> splice() method to delete them
      let removableIndex = profile.experience
        .map((exp) => exp._id)
        .indexOf(experienceId);

      // if (removableIndex == true) {
      profile.experience.splice(removableIndex, 1);

      profile = await profile.save();
      response
        .status(200)
        .json({ msg: "Experience is deleted", profile: profile }); // once experience is removed i want to get back my profile
      // }
    } catch (error) {
      console.error(error);
      response.status(500).json({ error: [{ msg: error.message }] });
    }
  }
);

/*  8. 
    @usage: Add Education of a profile
    @url: api/profiles/education/
    @fields: school, degree, fieldOfStudy, from, to, current, description
    @method: PUT
    @access: PRIVATE  // only that particular user/person can UPDATE his own profile not other one.
*/
router.put(
  "/education",
  // perform form validation
  [
    body("school").notEmpty().withMessage("School is Required"),
    body("degree").notEmpty().withMessage("Degree is Required"),
    body("fieldOfStudy").notEmpty().withMessage("FieldOfStudy is Required"),
    body("from").notEmpty().withMessage("From is Required"),
    body("description").notEmpty().withMessage("Description is Required"),
  ],
  authenticate,
  async (request, response) => {
    let errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(401).json({ errors: errors.array() });
    }

    // after validation successful
    try {
      // receiving form data
      let { school, degree, fieldOfStudy, from, to, current, description } =
        request.body;

      // now fill the 'Experience' object
      let newEducation = {
        school: school,
        degree: degree,
        fieldOfStudy: fieldOfStudy,
        from: from,
        to: to ? to : " ",
        current: current ? current : false,
        description: description,
      };
      // get profile of a user
      let profile = await Profile.findOne({ user: request.user.id }); // we get userId after ecoding the "Token"

      // check profile is exist or not
      if (!profile) {
        return response
          .status(400)
          .json({ errors: [{ msg: "No Profile is found" }] });
      }

      //  After profile is find then we add them
      // since 'experience' is an array, therefor adding object to an array -> 1. push() 2. unshift()
      // 👍 adding "newEducation" in 'profile' array
      profile.education.unshift(newEducation); // unshift() -> add data in front
      profile = await profile.save(); // save newEducation in profile object
      response.status(200).json({ profile: profile }); // 👿  //  here we getting updated profile
    } catch (error) {
      console.error(error);
      response.status(500).json({ error: [{ msg: error.message }] });
    }
  }
);

/*  9. 
    @usage: Delete an Education of a profile
    @url: api/profiles/education/:eduId
    @fields: no fields
    @method: DELETE
    @access: PRIVATE  // only logged in people do this request
 */
router.delete("/education/:eduId", authenticate, async (request, response) => {
  try {
    //  getting education id from Token
    let educationID = request.params.eduId;
    console.log("55555555555555555555555555555555555///");
    console.log(educationID);

    //  before deleting profile education we need to check them exist or nor
    let profile = await Profile.findById({ user: request.user.id });

    if (!profile) {
      return response
        .status(400)
        .json({ error: [{ msg: "no Profile education is Found" }] });
    }

    // once we get the profile then we delete them -> splice() method to delete them
    // let removableIndex = profile.education
    //   .map((edu) => edu._id)
    //   .indexOf(educationID);

    // if (removableIndex !== -1) {
    // profile.education.splice(removableIndex, 1);
    profile.education.findByIdAndDelete(educationID);
    profile = await profile.save();
    response
      .status(200)
      .json({ msg: "Education is deleted", profile: profile });
    // }
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: [{ msg: error.message }] });
  }
});

/*  10.  
    @usage: Get all profile
    @url: api/profiles/all
    @fields: no fields
    @method: GET
    @access: PUBLIC  
*/
router.get("/all", async (request, response) => {
  try {
    let profiles = await Profile.find().populate("user", ["name", "avatar"]);

    if (!profiles) {
      return response
        .status(400)
        .json({ errord: [{ msg: "No profiles found" }] });
    }

    response.status(200).json({ profiles: profiles }); // here we get an object of profile
    // console.log(
    //   "9999999999999999999999999 Profile Router 9999999999999999999999999"
    // );
    // console.log(profiles);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: [{ msg: error.message }] });
  }
});

/*  11. 
    @usage: Get profile of a specific user with profile-id
    @url: api/profiles/:developerId      //  "userId" getting from url itself
    @fields: no fields
    @method: GET
    @access: PUBLIC  // anyone can access their own profile -> NO authentication required / NO verification required
*/
router.get("/:developerId", async (request, response) => {
  try {
    // getting "userId" from url  and  send them to the server
    let developerId = request.params.developerId; // getting "developerId" from url/parameter and store them local storage

    // console.log(
    //   "%%%%%%%%%%%%%% Profile Router => developerId %%%%%%%%%%%%%%%%%%%%%%"
    // );
    // console.log(developerId);

    let profile = await Profile.findById(developerId).populate("user", [
      "name",
      "avatar",
    ]);

    // console.log(
    //   "$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$"
    // );
    // console.log(profile);

    if (!profile) {
      return response
        .status(400)
        .json({ error: [{ message: "No Profile Found for this User" }] });
    }
    response.status(200).json({ profile: profile });
    // console.log(
    //   "&&&&&&&&&&&&&&&&&&&&&&&& Profile Router &&&&&&&&&&&&&&&&&&&&&&&&"
    // );
    // console.log(profile);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: [{ msg: error.message }] });
  }
});
module.exports = router;
