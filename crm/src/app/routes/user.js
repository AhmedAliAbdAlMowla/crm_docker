"use strict"
const router = require("express").Router();
const upload = require("../config/multer");
const userController = require("../controllers/user");
const auth = require("../middleware/auth");
// const isAdmin = require("../middleware/isAdmin");

// Login 
router.post("/login", userController.login);

// Register 
router.post("/signup",userController.signup); 

// // get user profile data
router.get("/profile", auth, userController.getUser);
// // update user profile data
router.patch("/profile", auth, userController.updateUser);

 // get user profile image
router.get("/profile/image", auth,  userController.getProfileImage);
// // upload user profile image
router.post("/profile/image", auth, upload.single("file"), userController.uploadProfileImage);


// // update user account password
router.patch("/account/password", auth,userController.updatePassword);

// //  Forgot Password 
router.post("/account/recover",userController.recover);
router.post("/account/token/check",userController.checkToken);
router.post("/account/password/reset",userController.resetPassword);

module.exports = router;