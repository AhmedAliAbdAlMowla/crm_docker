const router = require("express").Router();
const upload =require( "../config/multer");
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");
const adminController = require("../controllers/admin");
const folderController =require( "../controllers/folder");
const fileController =require( "../controllers/file");




router.get("/", [auth, isAdmin],  adminController.getAllAdmin);

router.get("/clients", [auth, isAdmin], adminController.getAllClient);
router.get("/client/:clientId", [auth, isAdmin], adminController.getOneClient);
router.patch("/client/profile/:clientId", [auth, isAdmin], adminController.updateClientProfile);


// folder routes
router.get("/client/folder/:clientId", [auth, isAdmin], folderController.getAll);
router.post("/client/folder/:clientId", [auth, isAdmin], folderController.create);
router.patch("/client/folder/:folderId", [auth, isAdmin], folderController.update);


// file routes           
router.get("/client/file/:folderId", [auth, isAdmin],  fileController.getAll); // get all files
router.post("/client/file/:folderId",  [auth, isAdmin], upload.single("file"), fileController.create);
router.patch("/client/file/:fileId", [auth, isAdmin], fileController.update);


module.exports = router;