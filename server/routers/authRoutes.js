const router = require("express").Router();

const AuthController = require("../controllers/AuthController");

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.get("/github", AuthController.githubLogin);
router.get("/github/callback", AuthController.githubCallback);

module.exports = router;
