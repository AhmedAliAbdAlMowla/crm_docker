"use strict"
const router = require("express").Router();
const projectContoller = require("../controllers/project");
const auth = require("../middleware/auth");

router.get("/", [auth], projectContoller.getAll);


module.exports = router;