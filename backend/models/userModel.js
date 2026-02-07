const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username:{type:String,required:true},
    emailId:{type:String,required:true,unique:true},
    password:{type:String,required:true,unique:true},
    role:{type:String,required:true},
    watchList:[{asteroidId:{type:String},name:{type:String},hazardous:{type:Boolean},lastKnownRiskScore:{type:Number},nextCloseApproachDate:{type:Date},nextMissDistanceKm:{type:Number},addedAt:{type:Date}}],
    preferences:{notifyHazardousOnly:{type:Boolean},notifyIfDistanceBelowKm:{type:Number},notifyHoursBeforeApproach:{type:Number},dailySummary:{type:Boolean},emailMotifications:{type:Boolean}}
});

const users = mongoose.model("users",userSchema);

module.exports={users};

