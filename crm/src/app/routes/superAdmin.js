  
const router = require("express").Router();
const userControllers = require("../controllers/user");
const superAdminController = require("../controllers/superAdmin");
const auth = require("../middleware/auth");
const isSuperAdmin = require("../middleware/isSuperAdmin");
const folderController =require( "../controllers/folder");
const fileController =require( "../controllers/file");

router.get("/user/profile/:userId",[auth, isSuperAdmin], superAdminController.getOneUser);
router.patch("/user/profile/:userId",[auth, isSuperAdmin], superAdminController.updateUserProfile);
router.delete("/user/:userId", [auth, isSuperAdmin], userControllers.delete);
router.delete("/client/file/:fileId", [auth,isSuperAdmin] ,fileController.delete);
router.delete("/client/folder/:folderId", [auth, isSuperAdmin], folderController.delete);

module.exports = router;