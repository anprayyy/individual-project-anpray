const router = require("express").Router();

const authRoutes = require("./authRoutes");
const cvRoutes = require("./cvRoutes");
const expRoutes = require("./expRoutes");
const paymentRoutes = require("./paymentRoutes");

router.use("/auth", authRoutes);
router.use("/cvs", cvRoutes);
router.use("/experiences", expRoutes);
router.use("/payments", paymentRoutes);

module.exports = router;
