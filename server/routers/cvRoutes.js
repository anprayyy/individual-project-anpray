const router = require("express").Router();
const CvController = require("../controllers/CvController");
const authentication = require("../middlewares/authentication");
const { authorizationCV } = require("../middlewares/authorization");

router.use(authentication);

router.post("/", CvController.createCV);
router.get("/", getAllCV);
router.get("/:id", getDetailCV);
router.put("/:id", authorizationCV, updateCV);
router.delete("/:id", authorizationCV, deleteCV);

module.exports = router;
