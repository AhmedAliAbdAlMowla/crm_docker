const router = require("express").Router();
const taskController = require("../controllers/task");
const auth = require("../middleware/auth");

router.get("/:projectId", [auth], taskController.getAll);

module.exports = router;
