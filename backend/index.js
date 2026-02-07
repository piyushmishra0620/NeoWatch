require("dotenv").config();

const {app} = require("./app");
const http = require("http");
const {connectToDb} = require("./connections/connection");
const initSocket = require("./sockets");
const port = process.env.PORT || 3000;


connectToDb();

const server = http.createServer(app);

initSocket(server);

server.listen(port,()=>{
    console.log(`Server running at http://localhost:${port}`);
});
