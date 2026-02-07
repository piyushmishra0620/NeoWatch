const authRoutes = require("./routes/authRoutes");
const apiRoutes = require("./routes/apiRoutes");
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");

app.use(cookieParser());
app.use(express.urlencoded());
app.use(express.json());
const allowedOrigins = (process.env.FRONTEND_ORIGIN || "http://localhost:3000,http://localhost:3001")
    .split(",")
    .map((origin)=>origin.trim())
    .filter(Boolean);

app.use(cors({
    origin:allowedOrigins,
    credentials:true
}));

app.use("/auth",authRoutes);
app.use("/api",apiRoutes);

module.exports = {app};

