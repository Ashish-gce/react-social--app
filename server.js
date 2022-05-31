const express = require("express");
const app = express();
const cors = require("cors"); // torun on cross / multiple platform.
const dotEnv = require("dotenv");
const mongoose = require("mongoose");

// configure cors
app.use(cors());

// configure express to receive form data from client
app.use(express.json()); // receive form data in "JSON" format

// dotEnv configuration
dotEnv.config({ path: "./.env" }); // it store application credential's

const port = process.env.PORT || 5000; // general PORT number of nodeJS to run is  5000

// mongoDB configuration
const connectDB = async () => {
  const conn = await mongoose
    .connect(
      `mongodb+srv://ashish_gce:%40AsHish74AK@react-social.kxtqs.mongodb.net/react-social-db?retryWrites=true&w=majority`
    )
    .then((response) => {
      console.log("connected to MongoDB Cloud Successfuly......");
    })
    .catch((error) => {
      console.error(error);
      process.exit(1); // "STOP" the process if unable to connect to mongoDB database
    });
};

// use as a function
connectDB();

// simple get url (Request)
app.get("/", (request, response) => {
  response.send(`<h2>Welcome to React-Social-App backend</h2>`);
});

//  //  🚀 🚀 🚀 V. V. Imp. Router configuration to display any data/document a/c to "url" that user's click  🚀 🚀 🚀  //  //
// router configuration
app.use("/api/users", require("./router/userRouter"));
app.use("/api/posts", require("./router/postRouter"));
app.use("/api/profiles", require("./router/profileRouter"));

// only "PORT_NO",  not  'host_name' b'z we deploy our application on mongoose cloud
// So, default host_name is  http://127.0.0.1:5000/
app.listen(port, () => {
  console.log(`Express Server is started at PORT: ${port}`);
});
