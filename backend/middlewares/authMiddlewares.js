const jwt = require('jsonwebtoken');
const { users } = require('../models/userModel');

const protected = async (req, res, err, next) => {
    try {
        const token = req.cookie?.token;
        if (!token) {
            res.status(404).json({ error: "Unauthorized Access." });
        }
        const verifiedtoken = jwt.verify(token, process.env.JWT_SECRET);
        if (!verifiedtoken) {
            res.status(404).json({ error: "Unauthorized Access." });
        }
        req.user = await users.findById(verifiedtoken.id);
        next();
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

exports.protected = protected;
