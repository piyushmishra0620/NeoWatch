const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema({
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users",
        required:true
    },
    username:{
        type:String,
        required:true
    },
    message:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
});

const chatMessageModel = new mongoose.model("chatMessages",chatMessageSchema);

module.exports={chatMessageModel};
