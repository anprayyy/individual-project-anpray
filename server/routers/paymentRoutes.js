const router = require("express").Router();
const PaymentController = require("../controllers/PaymentController");

const authentication = require("../middlewares/authentication");
const { authorizationPayment } = require("../middlewares/authorization");

router.use(authentication);

router.post("/", PaymentController.createPayment);
router.get("/", PaymentController.getMyPayments);
router.patch("/:id", PaymentController.updatePaymentStatus);

module.exports = router;
