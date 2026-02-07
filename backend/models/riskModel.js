const mongoose = require("mongoose");

const riskModelSchema = new mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId,ref:"users",unique:true},
    name:{type:String},
    weights:{diametWeight:{type:Number},velocityWeight:{type:Number},distanceWeight:{type:Number},moidWeight:{type:Number}},
    normalizationMethod:{type:String}
});

const riskModels = new mongoose.model("riskModels",riskModelSchema);

module.exports = {riskModels};