//  🚀 🚀  🚀  🚀  REST API Configuration  🚀  🚀  🚀

const express = require("express");
const router = express.Router(); // "Router()" -> predefined function in express
const authenticate = require("../middlewares/authenticate");
const Post = require("../models/Post");
const User = require("../models/User");
const { body, validationResult } = require("express-validator");

/* 1.
    @usage : Create a new POst
    @url : /api/posts
    @felds : text, image
    @method : POST
    @access : PRIVATE
*/

router.post(
  "/",
  // perform form validation
  [
    body("text").notEmpty().withMessage("Text is required..."),
    body("image").notEmpty().withMessage("Image is required..."),
  ],
  authenticate,
  async (request, response) => {
    //  display / return error message if form validation is not successful
    let error = validationResult(request);
    if (!error.isEmpty()) {
      return response.status(401).json({ error: error.array() }); // 401 -> unauthorized error
    }
    try {
      // NOTE: here, How we get "user" here ? -> by the help of authentication we get 'userId'
      let user = await User.findById(request.user.id);

      // after getting user, we create a new post
      let newPost = {
        // by userId, we know - who is the person, who is making the post, like, dislike
        user: request.user.id, // through 'Token' we get userId
        text: request.body.text, // form data  - who made the post
        image: request.body.image, // form data  - who made the post
        //  'name' and 'user' comes from  -  User table
        name: user.name,
        avatar: user.avatar,
      };
      // create a post
      let post = new Post(newPost); // here we creating new post object
      post = await post.save(); // once save the "post" then we get that post
      response.status(200).json({ post: post }); // as in response we receive post as it is.
    } catch (error) {
      console.error(error);
      response.status(500).json({ error: [{ msg: "error.message" }] });
    }
  }
);

/* 2.
    @usage : Get All Posts
    @url : /api/posts/
    @felds : no fields
    @method : GET
    @access : PRIVATE
*/

router.get("/", authenticate, async (request, response) => {
  try {
    // here we getting all 'post' from database -> find()
    let posts = await Post.find();

    // if there is 'no post' in starting time
    if (!posts) {
      return response
        .status(400)
        .json({ error: [{ message: "No Post is Found." }] });
    }
    response.status(200).json({ posts: posts });
  } catch (error) {
    console.error(error);
    response.json(500).json({ error: [{ message: "error message" }] });
  }
});

/* 3.
    @usage : Get A Post with Post-Id
    @url : /api/posts/:postId
    @felds : no fields
    @method : GET
    @access : PRIVATE
*/
router.get("/:postId", authenticate, async (request, response) => {
  // "/:postId" -> very imp. in case of dynamic
  try {
    // here 1st we get the "Id" -> from parameter
    let postId = request.params.postId;

    // after getting "postId" -> from parameter  -  we've to get post of that particular postId
    let post = await Post.findById(postId); // receive particular post and store in local storage
    if (!post) {
      return response
        .status(400)
        .json({ error: [{ message: "There is not post regarding this Id" }] });
    }
    response.status(200).json({ post: post });
  } catch (error) {
    console.error(error);
    response.json(500).json({ error: [{ message: "error message" }] });
  }
});

/* 4.
    @usage : Delete a Post with postId
    @url : /api/posts/:postId
    @felds : no fields
    @method : DELETE
    @access : PRIVATE
*/
// router.delete("/:postId", authenticate, async (request, response) => {
//   // "/:postId" -> very imp. in case of dynamic id
//   try {
//     // here 1st we get the "Id" -> from parameter
//     let postId = request.params.postId;

//     console.log("#########################################################");
//     console.log(postId);

//     // check if post is exists
//     let post = await Post.findById(postId); // receive particular post and store in local storage

//     console.log("55555555555555555555555555555555555555555555555555555");
//     console.log(post);

//     if (!post) {
//       return response
//         .status(400)
//         .json({ error: [{ message: "There is not post regarding this Id" }] });
//     }

//     // if post exist then deleted them
//     post = await Post.findByIdAndDelete(postId);
//     await post.save();

//     // after post deleted we get deleted post as in response
//     response.status(200).json({
//       msg: "post is deleted",
//       post: post,
//     });
//   } catch (error) {
//     console.error(error);
//     response.json(500).json({ error: [{ message: "error message" }] });
//   }
// });

router.delete("/:postId", authenticate, async (request, response) => {
  try {
    let postId = request.params.postId;
    console.log("#########################################################");
    console.log(postId);

    // check if post is exists
    let post = await Post.findById(postId);
    if (!post) {
      return response.status(400).json({ errors: [{ msg: "No Post Found" }] });
    }
    post = await Post.findByIdAndRemove(postId);
    response.status(200).json({
      msg: "Post is Deleted",
      post: post,
    });
  } catch (error) {
    console.error(error);
    response.status(500).json({ errors: [{ msg: error.message }] });
  }
});

/* 5.
    @usage : Like a Post with postId
    @url : /api/posts/like/:postId
    @felds : no fields
    @method : PUT 
    @access : PRIVATE
*/
router.put("/like/:postId", authenticate, async (request, response) => {
  try {
    let postId = request.params.postId;

    // check if post is exists
    let post = await Post.findById(postId);

    if (!post) {
      return response
        .status(400)
        .json({ error: [{ message: "Sorry! Not Found PostId" }] });
    }

    // check if the user has already been liked or not  ->  if liked then my user already contains data
    //  // "post.likes"  -> is an array  that contains "likes" -> as an object
    //  // post.likes.filter() -> here we looping through each like of the array in which we're checking
    //  // my logged_in person  "request.user.id" -> b'z each person can do a single likes or dislike
    if (
      post.likes.filter(
        (like) => like.user.toString() === request.user.id.toString()
      ).length > 0
    ) {
      return response
        .status(400)
        .json({ error: [{ message: "Post has already been liked" }] });
    }

    // like the post (add our like  ->  push() / unshift())  ->  if the post is not liked previously
    // 👍  "post.likes" -> is an ARRAY,  unshift({ user: request.user.id }) -> add a like as an object into them.
    post.likes.unshift({ user: request.user.id });

    post.save(); // v. Imp. to save it in DB  ->  update it to database

    response.status(200).json({ post: post });
  } catch (error) {
    console.error(error);
    response.json(500).json({ error: [{ message: "error message" }] });
  }
});

/* 6.
    @usage : Un-Like Post by postId
    @url : /api/posts/unlike/:postId
    @felds : no fields
    @method : PUT 
    @access : PRIVATE
*/
// // 🚀 🚀 🚀 everybody is not "unlike" -> condition -> if anybody likes the post then he can unlike / dislike

//  like -> added an object to the array.  unlike -> removed an object from the array
router.put("/unlike/:postId", authenticate, async (request, response) => {
  try {
    let postId = request.params.postId;
    // check if post is exists
    let post = await Post.findById(postId);
    if (!post) {
      return response
        .status(400)
        .json({ error: [{ message: "Sorry! Not Found PostId" }] });
    }

    // check if user has already been liked, if don't like then we don't dislike them
    if (
      post.likes.filter(
        (like) => like.user.toString() === request.user.id.toString()
      ).length === 0
    ) {
      return response
        .status(400)
        .json({ error: [{ message: "Post has not been liked" }] }); // So, we don't dislike them
    }

    // "unlike"  the post (remove our 'like' if above condition is satisfied  ->  pop() / shift())  ->  if the post is liked previously
    let removableIndex = post.likes
      .map((like) => like.user.toString())
      .indexOf(request.user.id.toString());
    // check removable index -> (-1)  ->  show's empty
    if (removableIndex !== -1) {
      // 👍  "post.unlikes" -> is an ARRAY,
      post.likes.splice(removableIndex, 1);
      post.save(); // v. Imp. to save it in DB  ->  update it to database
      response.status(200).json({ post: post });
    }
  } catch (error) {
    console.error(error);
    response.json(500).json({ error: [{ message: "error message" }] });
  }
});

/* 7.
    @usage : Create Comment to a Post by postId
    @url : /api/posts/comment/:postId
    @felds : text
    @method : POST 
    @access : PRIVATE
*/
router.post(
  "/comment/:postId",
  // perform form validation
  [body("text").notEmpty().withMessage("Text is required")],
  authenticate,
  async (request, response) => {
    //  display / return error message if form validation is not successful
    let error = validationResult(request);
    if (!error.isEmpty()) {
      return response.status(401).json({ error: error.array() }); // 401 -> unauthorized error
    }

    try {
      // here we receive "postId" to check post is exist / made or not by user  to make comment on them
      let postId = request.params.postId; // since, 'postId' we receive from url

      let user = await User.findOne({ _id: request.user.id }); // here we brings user's table  ->   user id to receive  name and avatar of user from table

      //  we need to add the comment to the post
      //  1st check post is exist or not  to the comment on them
      let post = await Post.findById(postId);
      if (!post) {
        return response
          .status(400)
          .json({ error: [{ message: "No Post Found" }] });
      }

      // otherwise making a new comment on that post
      let newComment = {
        user: request.user.id, // person who makes the comment
        text: request.body.text, // text comes from form data
        // below 2-things comes from user table
        name: user.name,
        avatar: user.avatar,
      };

      // adding my new comment to the database   'post.comments' -> comments is an object inside post array
      post.comments.unshift(newComment);
      post = await post.save(); // save comment to the database
      response.status(200).json({ post: post });
    } catch (error) {
      console.error(error);
      response.status(500).json({ error: [{ message: error.message }] });
    }
  }
);

/* 8.
    @usage : Delete Comment of a Post by postId
    @url : /api/posts/comment/:postId/:commentId
    @felds : no-fields
    @method : DELETE
    @access : PRIVATE
*/
router.delete(
  "/comment/:postId/:commentId",
  authenticate,
  async (request, response) => {
    try {
      //  getting post_id  and  comment_id
      let postId = request.params.postId; // getting 'postId' from parameter
      let commentId = request.params.commentId; // getting 'commentId' from parameter

      // before deleting a comment we need to check "post" is exist or not
      let post = await Post.findById(postId);

      // pull the comments of a post
      let comment = post.comments.find((comment) => comment.id === commentId);

      // make sure the comment exists
      if (!comment) {
        return response.status(404).json({ msg: "Comment not exists" });
      }

      // check user, is he only made the comment
      if (comment.user.toString() !== request.user.id) {
        return response
          .status(401)
          .json({ message: "User is Not Authorized." });
      }

      // get remove index
      let removableIndex = post.comments
        .map((comment) => comment.user.toString())
        .indexOf(request.user.id);
      if (removableIndex !== -1) {
        post.comments.splice(removableIndex, 1);
        await post.save();
        response.status(200).json({ post: post });
      }
    } catch (error) {
      console.error(error);
      response.status(500).json({ error: [{ message: error.message }] });
    }
  }
);

module.exports = router;
