const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const {users} = require("../models/userModel");

const signup =async (req,res)=>{
    const {username,email,password,role} = req.body;
    try{
        if(role=="user"){
            const existingUser = await users.findOne({emailId:email});
            if(existingUser){
                return res.status(401).json({error:"User Already exists with this EmailId"});
            }
            const rounds = await bcrypt.genSalt(12);
            const hashedPassword = await bcrypt.hash(password,rounds);
            const user = await  users.create({username:username,emailId:email,password:hashedPassword,role:role});
            const token = jwt.sign({id:user._id,name:user.username,email:user.email,password:hashedPassword,role:user.role},process.env.JWT_SECRET);
            res.cookie("token",token,{
                httpOnly:true,maxAge:30*24*60*60,
                expires: new Date(Date.now()+30*24*60*60)
            });
            return res.status(200).json({success:"User created."});
        }else if(role=="researcher"){
            const existingUser = await users.findOne({emailId:email});
            if(existingUser){
                return res.status(401).json({error:"Researcher Already exists with this EmailId"});
            }
            const rounds = await bcrypt.genSalt(12);
            const hashedpassword = await bcrypt.hash(password);
            const researcher = await researchers.create({username:username,emailId:email,password:hashedpassword,role:role});
            const token = jwt.sign({id:researcher._id,username:researcher.username,email:researcher.emailId,password:researcher.password,role:researcher.role});
            res.cookie("token",token,{
                httpOnly:true,maxAge:30*24*60*60,
                expires: new Date(Date.now()+30*24*60*60)
            });
            return res.status(200).json({success:"Researcher created."});
        }
    }catch(err){
        console.error(err);
        return res.status(500).json({error:"Server side error occurred!"});
    }
}

const login = async (req,res)=>{
    const {emailId,password,role} = req.body;
    if(role=="user"){
        const existingUser = await users.findOne({emailId:email,role:role});
        if(!(existingUser)){
            return res.status(404).json({error:"User doesnot exist with this emailId"});
        }
        const hashedPassword = await bcrypt.compare(password,existingUser.password);
        if(!(hashedPassword)){
            return res.status(400).json({error:"Invalid Password."})
        }
        const token = jwt.sign()
    }else if(role=="researcher"){

    }
}