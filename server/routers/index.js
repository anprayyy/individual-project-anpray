const router = require("express").Router();

const authRoutes = require("./authRoutes");
const cvRoutes = require("./cvRoutes");
const expRoutes = require("./expRoutes");

router.use("/auth", authRoutes);
router.use("/cvs", cvRoutes);
router.use("/experiences", expRoutes);

module.exports = router;
