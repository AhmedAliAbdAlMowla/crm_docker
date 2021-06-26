"use strict"
const router = require("express").Router();
const auth = require("../middleware/auth");
const  folderController =require( "../controllers/folder");

router.get("/", auth, folderController.getAll);
router.post("/", auth, folderController.create);
router.patch("/:folderId", auth, folderController.update);
router.delete("/:folderId", auth, folderController.delete);

module.exports= router;