const router = require("express").Router();
const upload =require( "../config/multer");
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");
const adminController = require("../controllers/admin");
const folderController =require( "../controllers/folder");
const fileController =require( "../controllers/file");
const projectContoller = require("../controllers/project");
const taskController = require("../controllers/task");




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

// project
router.get("/client/project/:clientId", [auth, isAdmin], projectContoller.getAll);
router.post("/client/project/:clientId", [auth, isAdmin], projectContoller.create);
router.delete("/client/project/:projectId",[auth, isAdmin], projectContoller.delete);
// task
 router.get("/client/task/:projectId", [auth, isAdmin], taskController.getAll);
 router.post("/client/task/:projectId", [auth, isAdmin], taskController.create);
router.patch("/client/task/:taskId", [auth, isAdmin], taskController.update);
router.delete("/client/task/:taskId", [auth, isAdmin], taskController.delete);
module.exports = router;