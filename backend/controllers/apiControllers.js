const axios = require("axios");

const BASE_URL = "https://api.nasa.gov/neo/rest/v1";
const apikey = process.env.NASA_API_KEY;
const feedController = async (req,res)=>{
    const {startDate,endDate} = req.query;
    try{
        const response = await axios.get(`${BASE_URL}/feed`,{
            params:{
                start_date:startDate,
                end_date:endDate,
                api_key:apikey
            }
        });

        return res.json(response.data);
    }catch(error){
        console.error(error);
        return res.status(500).json({error:{message:"Failed to fetch data from api."}})
    }
}

const browseController = async ()=>{
    const {page} = req.query;
    try{
        const response = await axios.get(`${BASE_URL}/neo/browse`,{
            params:{
                page:page,
                size:20,
                api_key:apikey
            }
        });

        return response.data;
    }catch(err){
        console.error(err);
        throw new Error(err);
    }
}

module.exports = {feedController,browseController};
