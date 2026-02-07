const jwt = require("jsonwebtoken");
const {users} = require("../models/userModel");

const protected = async (req,res,next)=>{
    try{
        const token = req.cookies?.token;
        if(!(token)){
            return res.status(404).json({error:"Cannot find user session!"});
        }
        const verifiedToken = jwt.verify(token,process.env.JWT_SECRET);
        if(!(verifiedToken)){
            return res.status(401).json({error:"Forbidden Access"});
        }
        req.user = await users.findById(verifiedToken.id);
        next();
    }catch(err){
        console.error(err);
        return res.status(500).json({error:"Server side error."});
    }
}

module.exports = {protected};