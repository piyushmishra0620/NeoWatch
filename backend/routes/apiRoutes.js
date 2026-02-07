const express = require("express");
const {feedController,browseController,asteroidDetailController,getWatchlistController,addWatchlistController,researchQueryController,getRiskModelsController,saveRiskModelController,setDefaultRiskModelController} = require("../controllers/apiControllers");
const {protected} = require("../middlewares/authMiddlewares");

const server = express.Router();

server.get("/recents",feedController);
server.get("/browse",browseController);
server.get("/asteroid/:id",asteroidDetailController);
server.get("/watchlist",protected,getWatchlistController);
server.post("/watchlist",protected,addWatchlistController);
server.post("/research/query",protected,researchQueryController);
server.get("/research/risk-models",protected,getRiskModelsController);
server.post("/research/risk-models",protected,saveRiskModelController);
server.post("/research/risk-models/default",protected,setDefaultRiskModelController);

module.exports = server;
