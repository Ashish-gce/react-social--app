//  to verify the token we write this code

// const { response } = require("express");
// const { request } = require("express");
const jwt = require("jsonwebtoken");

// we write express.js middleware
let authenticate = async (request, response, next) => {
  // we need to verify the token,  but before verify we need to receive the "Token"
  let token = request.header("x-auth-token");
  // if Token is there then NO issue, but if Token is not available then show the error
  if (!token) {
    return response
      .status(401)
      .json({ msg: "No Token Provided, Authentication Denied!" }); //  (401) -> is the status of unauthorized
  }

  try {
    // using same SECREAT_KEY to create the token and decode the token
    // "decoded" -> store decoded token that contain "payload" -. (user: {id: ----,  name: ----}) of token in userRouter.js file
    let decoded = await jwt.verify(token, process.env.JWT_SECRET_KEY);
    request.user = decoded.user; // "decoded" is a payload of user {} object of userRouter.js file
    next(); // carry to the next level
  } catch (error) {
    console.error(error); // 500 -> server error
    response.status(500).json({ msg: "Invalid Token" });
  }
};

module.exports = authenticate;
