const mongoose = require("mongoose");

const savedQuerySchema = new mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId,ref:"users",unique:true},
    name:{type:String},
    filters:{
        minDiameter:{type:Number},
        maxMOID:{type:Number},
        hazardousOnly:{type:Boolean},
        minVelocity:{type:Number}
    },
    resultCount:{type:Number},
    lastExecutedAt:{type:Date},
    createdAt:{
        type:Date
    }
});

const savedQueries = new mongoose.model("savedQueries",savedQuerySchema);

module.exports = {savedQueries};