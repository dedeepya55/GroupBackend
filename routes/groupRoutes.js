const router = require("express").Router();
const { getAllGroups, createGroup } = require("../controllers/groupController");

router.get("/", getAllGroups);
router.post("/create", createGroup);

module.exports = router;
