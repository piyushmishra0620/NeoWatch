const authRoutes = require("./routes/authRoutes");
const {connectToDb} = require("./connections/connection");
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

connectToDb();
app.use("/auth",authRoutes);

module.exports = {app};

