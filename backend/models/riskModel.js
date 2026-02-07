const mongoose = require("mongoose");

const riskModelSchema = new mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId,ref:"users",unique:true},
    defaultModelId:{type:String},
    models:[{
        modelId:{type:String},
        name:{type:String},
        weights:{
            diameterWeight:{type:Number},
            velocityWeight:{type:Number},
            distanceWeight:{type:Number},
            moidWeight:{type:Number},
            hazardMultiplier:{type:Number}
        },
        thresholds:{
            low:{type:Number},
            medium:{type:Number},
            high:{type:Number}
        },
        normalizationMethod:{type:String},
        isDefault:{type:Boolean},
        createdAt:{type:Date},
        updatedAt:{type:Date}
    }]
});

const riskModels = new mongoose.model("riskModels",riskModelSchema);

module.exports = {riskModels};
