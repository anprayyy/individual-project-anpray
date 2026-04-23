require("dotenv").config();
const express = require("express");
const router = require("./routers/index");
const app = express();
const port = 3000;
const cors = require("cors")
const errorHandler = require("./middlewares/errorHandler");

app.use(cors())
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(router);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
