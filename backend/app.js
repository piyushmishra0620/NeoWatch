const authRoutes = require("./routes/authRoutes");
const apiRoutes = require("./routes/apiRoutes");
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");

app.use(cookieParser());
app.use(express.urlencoded());
app.use(express.json());
app.use(cors({
    origin:"*"
}));

app.use("/auth",authRoutes);
app.use("/api",apiRoutes);

module.exports = {app};

