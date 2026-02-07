const {chatMessageModel} = require("../models/chatMessagemodel");

function chatSocketHandler(io){
    io.on("connection",async (socket)=>{
        console.log(`${socket.user.username} connected to chat`);
        try{
            const messages = await chatMessageModel.find().sort({createdAt:-1}).limit(50).lean();

            socket.emit("chat_history",messages.reverse());
        }catch(err){
            console.error("Error fetching chat history:",err);
        }

        socket.on("send_message",async (messageText)=>{
            if(!messageText || messageText.trim()=="")return;
            try{
                const newMessage = await chatMessageModel.create({
                    sender:socket.user.id,username:socket.user.username,message:messageText.trim()
                });

                io.emit("receive_message",newMessage);
            }catch(err){
                console.error("Error saving chat message:",err);
            }
        });

        socket.on("disconnect",()=>{
            console.log(`${socket.user.username} disconnected!`);
        });
    });
}

module.exports = chatSocketHandler;