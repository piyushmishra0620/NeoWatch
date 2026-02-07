const {Server} = require("socket.io");
const jwt = require("jsonwebtoken");
const chatSocketHandler = require("./chatSocket");

function parseCookies(cookieHeader){
    if(!cookieHeader) return {};
    return cookieHeader.split(";").reduce((acc,part)=>{
        const [key,...rest] = part.trim().split("=");
        acc[key] = decodeURIComponent(rest.join("="));
        return acc;
    },{});
}

function initSocket(server){
    const allowedOrigins = (process.env.FRONTEND_ORIGIN || "http://localhost:3000,http://localhost:3001")
        .split(",")
        .map((origin)=>origin.trim())
        .filter(Boolean);

    const io = new Server(server,{
        cors:{
            origin:allowedOrigins,
            credentials:true
        }
    });

    io.use((socket,next)=>{
        try{
            const cookieHeader = socket.handshake.headers?.cookie;
            const cookies = parseCookies(cookieHeader || "");
            const token = cookies.token;
            if(!token){
                return next(new Error("Unauthorized"));
            }
            const payload = jwt.verify(token,process.env.JWT_SECRET);
            const username = payload.username || payload.name || "User";
            socket.user = {id:payload.id, username};
            next();
        }catch(err){
            next(new Error("Unauthorized"));
        }
    });

    chatSocketHandler(io);
    return io;
}

module.exports = initSocket;
