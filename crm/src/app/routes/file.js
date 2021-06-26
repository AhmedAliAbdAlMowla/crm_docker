"use strict"
const router = require("express").Router();
const upload =require( "../config/multer");
const auth = require("../middleware/auth");
const  fileController =require( "../controllers/file");


router.get("/:folderId", auth, fileController.getAll);
router.post("/:folderId", auth, upload.single("file"), fileController.create);
router.patch("/:fileId", auth, fileController.update);
router.delete("/:fileId", auth, fileController.delete);

module.exports= router;
