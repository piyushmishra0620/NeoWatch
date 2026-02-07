const {signup,login,logout,getUser} = require("../controllers/authControllers");
const {protected} = require("../middlewares/authMiddlewares");

const express = require("express");
const server = express.Router();

server.post("/signup",signup);
server.post("/login",login);
server.get("/getUser",protected,getUser);
server.delete("/logout",logout);

module.exports = server;
