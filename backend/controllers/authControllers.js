const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { users } = require("../models/userModel");
const {savedQueries} = require("../models/saved_queries");
const {riskModels} = require("../models/riskModel");
const {researchDataSets} = require("../models/researchDataSet");

const signup = async (req, res) => {
    const { username, email, password, role } = req.body;
    try {
        const existingUser = await users.findOne({ emailId: email });
        if (existingUser) {
            return res.status(401).json({ error: "User Already exists with this EmailId" });
        }
        const rounds = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, rounds);
        const user = await users.create({ username: username, emailId: email, password: hashedPassword, role: role });
        const token = jwt.sign({ id: user._id, name: user.username, email: user.emailId, role: user.role }, process.env.JWT_SECRET);
        res.cookie("token", token, {
            httpOnly: true, maxAge: 30 * 24 * 60 * 60,
            expires: new Date(Date.now() + 30 * 24 * 60 * 60)
        });
        return res.status(200).json({ success: "User created." });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server side error occurred!" });
    }
}

const login = async (req, res) => {
    const { emailId, password, role } = req.body;
    const existingUser = await users.findOne({ emailId: emailId, role: role });
    if (!(existingUser)) {
        return res.status(404).json({ error: "User doesnot exist with this emailId" });
    }
    const hashedPassword = await bcrypt.compare(password, existingUser.password);
    if (!(hashedPassword)) {
        return res.status(400).json({ error: "Invalid Password." })
    }
    const token = jwt.sign({ id: existingUser._id, username: existingUser.username, email: existingUser.emailId, role: existingUser.role },process.env.JWT_SECRET);
    res.cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60),
        maxAge: 30 * 24 * 60 * 60
    });
    return res.status(200).json({ success: "User found" });
}

const getUser = async (req,res)=>{
    try{
        const user = req.user;
        if(!(user)){
            return res.status(404).json({error:"Cannot find User"});
        }
        if(user.role=="researcher"){
            const savedqueries = await savedQueries.findOne({userId:user._id});
            const riskmodels = await riskModels.findOne({userId:user._id});
            const researchdatasets = await researchDataSets.findOne({userId:user._id});
            return res.status(200).json({success:"User found!",user:{}});
        }
        return res.status(200).json({success:"User found!",user:{username:user.username,emailId:user.emailId,role:user.role,watchList:user.watchList,preferences:user.preferences}});
    }catch(err){
        console.error(err);
        return res.status(500).json({error:"Server side Error occurred."});
    }
}

const logout = async (req,res)=>{
    try{
        res.clearCookie("token",{
            httpOnly:true,
            expires:new Date(Date.now()+30*24*60*60),
            maxAge:30*24*60*60
        });
    }catch(err){
        console.error(err);
        return res.status(500).json({error:"Server side error occurred."});
    }
}

module.exports = {signup,login,logout,getUser};