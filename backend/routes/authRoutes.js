const express = require('express');
const app = express();
const {protected} = require('../middlewares/authMiddlewares');
const {signup,login,logout,getuser} = require('../controllers/authControllers');

app.post("/signup",signup);
app.post("/login",login);
app.post("/logout",logout);
app.get("/protected",protected,getuser);

module.exports = app;