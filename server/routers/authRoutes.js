const router = require("express").Router();

const AuthController = require("../controllers/AuthController");

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/google-verify", AuthController.googleVerify);
router.get("/github", AuthController.githubLogin);
router.get("/github/callback", AuthController.githubCallback);
router.get("/google", AuthController.googleLogin);
router.get("/google/callback", AuthController.googleCallback);

module.exports = router;
