const router = require("express").Router();
const authentication = require("../middlewares/authentication");
const { authorizationExperience } = require("../middlewares/authorization");
const ExperienceController = require("../controllers/ExperienceController");

router.use(authentication);
router.post("/", ExperienceController.createExperience);
router.post("/bulk", ExperienceController.bulkCreate);
router.get("/cv/:cvId", ExperienceController.getExperienceByCV);
router.put(
  "/:id",
  authorizationExperience,
  ExperienceController.updateExperience,
);
router.delete(
  "/:id",
  authorizationExperience,
  ExperienceController.deleteExperience,
);

module.exports = router;
