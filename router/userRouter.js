//  //  In this file 'userRouter.js' data comes from "user.js" file Schema model.  //  //

//  🚀 🚀  🚀  🚀  REST API Configuration  🚀  🚀  🚀

const express = require("express");
const router = express.Router(); // "Router()" -> predefined function in express

// "express-validator" -> we use it for 'Server-Side' form validation.
const { body, validationResult } = require("express-validator");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User"); // we get user's table -> table schema
const authenticate = require("../middlewares/authenticate"); // for token authenticate purpose

/*
    @usage: to Register a user  ->  completely new user
    @url: /api/users/register
    @fields: name, email, password    ->  providing info. for registeration of any person
    @method: POST    -> "POST" method we use to create a new user
    @access: PUBLIC  -> b'z anybody can Register,  NO Token is required for registration
*/
router.post(
  "/register", // '/register' -> b'z  '/api.users' -> already configured in "server.js" file
  [
    // used for form validation purpose
    body("name").notEmpty().withMessage("Name is Required"),
    body("email").notEmpty().withMessage("Email is Required"),
    body("password").notEmpty().withMessage("Password is Required"),
  ],
  async (request, response) => {
    // getting validation result
    let errors = validationResult(request); // if any error occurs in form validation
    if (!errors.isEmpty()) {
      return response.status(400).json({ error: errors.array() }); // 400 -> for server error
    }

    try {
      //  here we receive below data from client form
      let { name, email, password } = request.body; // app.use(express.json()); -> already we configure this in "server.js" file to receive form data in "JSON" format
      //   here we check if user is exists or not by email
      let user = await User.findOne({ email: email }); // find-one record from 'user' table on basis of email -> that we receive from data

      if (user) {
        return response
          .status(401)
          .json({ errors: { msg: "User is Already Exists" } });
      }

      //   we've to insert a user if there is no user
      //   1st we've to incode the password using "bcrypt" -> we don't want to save plain password
      let salt = await bcrypt.genSalt(10); // 10 -> represents number of rounds of salt
      // hashing the existing password with salt and stored in same 'password' variable
      password = await bcrypt.hash(password, salt);

      //  avatar url   s -> "size",  r -> "rating",  d -> "default images"
      let avatar = gravatar.url(email, { s: "300", r: "pg", d: "mm" });

      //   🧴 🧴 insert the user into database -> User Table -> to maintain user in database  🧴 🧴
      user = new User({ name, email, password, avatar });
      await user.save(); // finally save it to database
      response.status(200).json({ msg: "Registration is successfully done" }); //  finally we display this message to user
    } catch (error) {
      console.error(error);
      response.status(500).json({ error: [{ msg: error.message }] }); // 500 -> server side error
    }
  }
);

/*
    @usage: to Login a user  ->  for existing user
    @url: /api/users/login
    @fields: email, password    ->  providing info. for registeration of any person
    @method: POST    -> "POST" method we used in to send data and check them
    @access: PUBLIC  -> b'z anybody can Login,  NO Token is required for registration
*/
router.post(
  "/login",
  [
    // validating 'email' and 'password' exist or not || correct or not
    body("email").notEmpty().withMessage("Email is Required"),
    body("password").notEmpty().withMessage("Password is Required"),
  ],
  async (request, response) => {
    // here we receive the validation result
    let error = validationResult(request);
    if (!error.isEmpty()) {
      // validation fails throw the error
      return response.status(400).json({ error: error.array() });
    }

    try {
      let { email, password } = request.body; // receiving form data

      // check email is correct or not
      let user = await User.findOne({ email: email });
      // if user is exist "NOT" issue but if not then issue in  LOGIN
      if (!user) {
        return response.status(401).json({
          errors: {
            message: "invalid email or email is not exist in database",
          },
        });
      }

      // check the password
      // here before comparing passworf 1st 'bcrypt' the encrypted password and then matched them equal or not
      let isMatch = await bcrypt.compare(password, user.password); //  "password" -> form password   "user.password" -> comes from database
      if (!isMatch) {
        return response.status(401).json({
          error: { message: "Invalid password OR password is not match" },
        });
      }

      // if both 'email' and 'password' is correct then create a token
      // create a token and send to the client
      // Token creation -> it contains  "payload" and  "secret_key"
      let payload = {
        user: {
          // in token we stuff some info. that is: id, name
          id: user.id,
          name: user.name,
        },
      };
      // now create token ->pass (payload, secret_key) and send it to the user -> get the Token
      jwt.sign(payload, process.env.JWT_SECRET_KEY, (error, token) => {
        if (error) throw error;

        //  😛 🛢️ 🖕 🤤 if login is successful the I'll get only  "Token" not received loggedin people information  b'z  to fetch logged-in people info. we've a seperate  'router'  to fetch user's info
        response.status(200).json({
          // after getting token we get respons like below
          msg: "Login is Success", //  display on client side as alert
          token: token, //  Token -> keep it in local storage
        });
      });
    } catch (error) {
      console.error(error);
      response.status(500).json({ error: { msg: error.message } });
    }
  }
);

/*
    @usage: to particular user info ->  for existing/particular user
    @url: /api/users
    @fields: no-fields 
    @method: GET    -> "GET" method we used to get data from server
    @access: PRIVATE  -> b'z no one access users data directly, we need to verify the "Tokens"
*/
// authenticate (middleware) -> to verify the Token
router.get("/me", authenticate, async (request, response) => {
  try {
    // get info. of the user Who is login
    // "request.user" -> comes from authenticate.js (request.user = decoded.user)
    let user = await User.findById(request.user.id).select("-password"); // select('-password') -> remove (don't) display password
    response.status(200).json({
      user: user, // this payload send to  private  "getUserInfo"
    });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: { msg: error.message } });
  }
});

module.exports = router;
