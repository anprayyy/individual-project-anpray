const router = require("express").Router();
const CvController = require("../controllers/CvController");
const authentication = require("../middlewares/authentication");
const { authorizationCV } = require("../middlewares/authorization");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

router.use(authentication);

router.post("/upload", upload.single("pdf"), CvController.createCVFromUpload);
router.post("/", CvController.createCV);
router.get("/", CvController.getAllCV);
router.get("/:id", CvController.getDetailCV);
router.put("/:id", authorizationCV, CvController.updateCV);
router.delete("/:id", authorizationCV, CvController.deleteCV);
router.get("/:id/review", authorizationCV, CvController.reviewCVWithAI);
router.get("/:id/download", authorizationCV, CvController.downloadCV);
router.post(
  "/review-upload",
  upload.single("pdf"),
  CvController.reviewUploadedCV,
);
router.patch(
  "/:id/imageUrl",
  authorizationCV,
  upload.single("uploadImage"),
  CvController.updateCVCoverUrlById,
);

module.exports = router;
