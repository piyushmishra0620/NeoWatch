const mongoose = require("mongoose");

const Mongo_URI = process.env.MOGNO_URI;

async function connectToDb(){
    try{
        await mongoose.connect(Mongo_URI);
        console.log("Connection with database successful!");
    }catch(error){
        console.error(error);
        return {error:{message:"Server Side Error occurred."},status:500};
    }
}

module.exports = {connectToDb};