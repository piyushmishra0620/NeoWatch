const mongoose = require("mongoose");

const researchDataSetSchema = new mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId,ref:"users",unique:true},
    name:{type:String},
    asteroids:[{asteroidID:{type:Number}}],
    filtersUsed:{
        minDiameter:{type:Number},
        maxDiameter:{type:Number},
        minVelocity:{type:Number},
        maxVelocity:{type:Number},
        maxMOID:{type:Number},
        hazardousOnly:{type:Boolean},
        dataRange:{
            start:{type:Date},
            end:{type:Date}
        }
    },
    recordCount:{
        type:Number
    }
});

const researchDataSets = new mongoose.model("researchDataSets",researchDataSetSchema);