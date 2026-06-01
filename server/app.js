require("dotenv").config();
const express = require("express");
const router = require("./routers/index");
const app = express();
const cors = require("cors");
const errorHandler = require("./middlewares/errorHandler");
const cookieParser = require("cookie-parser");
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(router);

app.use(errorHandler);

module.exports = app;
