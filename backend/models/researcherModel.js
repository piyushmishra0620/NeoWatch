const mongoose = require("mongoose");

const researcherSchema = new mongoose.Schema({
    username:{type:String,required:true},
    emailID:{type:String,required:true,unique:true},
    password:{type:String,required:true,unique:true},
    role:{type:String,required:true}
});

const researchers = new mongoose.model("researchers",researcherSchema);

module.exports = {researchers};
