const jwt = require("jsonwebtoken");
const cookie = require("cookie");

function socketAuthMiddleware(socket,next){
    try{
        const rawCookie = socket.handshake.headers.cookie;

        if(!(rawCookie)){
            return next(new Error("Authenticaton error:No cookies found!"));
        }

        const cookies = cookie.parse(rawCookie);
        const token = cookies.token;

        if(!(token)){
            return next(new Error("Authentication error:No token!"));
        }

        const decoded = jwt.verify(token,process.env.JWT_SECRET);

        socket.user = decoded;
        next();
    }catch(err){
        console.error("Socket Authentication failed",err.message);
        next(new Error("Authentication error"));
    }
}

module.exports=socketAuthMiddleware;