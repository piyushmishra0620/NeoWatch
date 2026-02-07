const mongoose = require("mongoose");

const mongo_uri = process.env.MOGNO_URI;

async function connectToDb(){
    try{
        await mongoose.connect(mongo_uri);
        console.log("Connected to database!");
    }catch(error){
        console.error(error);
        process.exit(1);
    }
}

module.exports = {connectToDb};