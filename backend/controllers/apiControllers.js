const axios = require("axios");
const {users} = require("../models/userModel");
const {savedQueries} = require("../models/saved_queries");
const {riskModels} = require("../models/riskModel");
const mongoose = require("mongoose");

const BASE_URL = "https://api.nasa.gov/neo/rest/v1";
const apikey = process.env.NASA_API_KEY;
const feedController = async (req,res)=>{
    let {startDate,endDate} = req.query;
    const now = new Date();
    const defaultStart = now.toISOString().slice(0,10);
    const defaultEnd = new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().slice(0,10);
    startDate = startDate || defaultStart;
    endDate = endDate || defaultEnd;

    const start = new Date(startDate);
    let end = new Date(endDate);
    if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
        const maxEnd = new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000);
        if (end.getTime() > maxEnd.getTime()) {
            end = maxEnd;
            endDate = end.toISOString().slice(0,10);
        }
    }
    try{
        const response = await axios.get(`${BASE_URL}/feed`,{
            params:{
                start_date:startDate,
                end_date:endDate,
                api_key:apikey
            }
        });

        return res.json({data:response.data});
    }catch(error){
        console.error(error);
        return res.status(500).json({error:{message:"Failed to fetch data from api."}})
    }
}

const browseController = async (req,res)=>{
    const {page} = req.query;
    try{
        const response = await axios.get(`${BASE_URL}/neo/browse`,{
            params:{
                page:page,
                size:20,
                api_key:apikey
            }
        });

        return res.json({data:response.data});
    }catch(err){
        console.error(err);
        return res.status(500).json({error:{message:"Failed to browse asteroids."}});
    }
}

const asteroidDetailController = async (req,res)=>{
    const {id} = req.params;
    try{
        const response = await axios.get(`${BASE_URL}/neo/${id}`,{
            params:{
                api_key:apikey
            }
        });
        return res.json({data:response.data});
    }catch(error){
        console.error(error);
        return res.status(500).json({error:{message:"Failed to fetch asteroid details."}});
    }
}

const getWatchlistController = async (req,res)=>{
    try{
        const user = req.user;
        if(!user){
            return res.status(401).json({error:{message:"Unauthorized"}});
        }
        return res.json({data:user.watchList || []});
    }catch(error){
        console.error(error);
        return res.status(500).json({error:{message:"Failed to fetch watchlist."}});
    }
}

const addWatchlistController = async (req,res)=>{
    try{
        const user = req.user;
        if(!user){
            return res.status(401).json({error:{message:"Unauthorized"}});
        }
        const {
            asteroidId,
            name,
            hazardous,
            lastKnownRiskScore,
            nextCloseApproachDate,
            nextMissDistanceKm
        } = req.body || {};

        if(!asteroidId){
            return res.status(400).json({error:{message:"asteroidId is required"}});
        }

        const exists = (user.watchList || []).some((item)=> item.asteroidId === asteroidId);
        if(exists){
            return res.status(200).json({message:"Already in watchlist"});
        }

        const entry = {
            asteroidId,
            name,
            hazardous,
            lastKnownRiskScore,
            nextCloseApproachDate,
            nextMissDistanceKm,
            addedAt:new Date()
        };

        await users.findByIdAndUpdate(user._id,{$push:{watchList:entry}});
        return res.status(201).json({message:"Added to watchlist"});
    }catch(error){
        console.error(error);
        return res.status(500).json({error:{message:"Failed to add to watchlist."}});
    }
}

const researchQueryController = async (req,res)=>{
    try{
        const user = req.user;
        if(!user || user.role !== "researcher"){
            return res.status(403).json({error:{message:"Researcher access only"}});
        }
        const {
            startDate:bodyStart,
            endDate:bodyEnd,
            filters = {}
        } = req.body || {};

        const now = new Date();
        const defaultStart = now.toISOString().slice(0,10);
        const defaultEnd = new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().slice(0,10);
        let startDate = bodyStart || defaultStart;
        let endDate = bodyEnd || defaultEnd;

        const start = new Date(startDate);
        let end = new Date(endDate);
        if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
            const maxEnd = new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000);
            if (end.getTime() > maxEnd.getTime()) {
                end = maxEnd;
                endDate = end.toISOString().slice(0,10);
            }
        }

        const response = await axios.get(`${BASE_URL}/feed`,{
            params:{
                start_date:startDate,
                end_date:endDate,
                api_key:apikey
            }
        });

        const neo = response.data?.near_earth_objects || {};
        const list = Object.values(neo).flat();

        const toNumber = (value)=>{
            const num = value == null ? NaN : Number(value);
            return Number.isFinite(num) ? num : null;
        }

        const avgDiameterKm = (asteroid)=>{
            const km = asteroid?.estimated_diameter?.kilometers;
            if(km?.estimated_diameter_min != null && km?.estimated_diameter_max != null){
                return (km.estimated_diameter_min + km.estimated_diameter_max) / 2;
            }
            return null;
        }

        const filtered = list.filter((asteroid)=>{
            const approach = asteroid?.close_approach_data?.[0];
            const diameterKm = avgDiameterKm(asteroid);
            const velocity = toNumber(approach?.relative_velocity?.kilometers_per_hour);
            const missKm = toNumber(approach?.miss_distance?.kilometers);
            const orbitingBody = approach?.orbiting_body;

            if(filters.hazardousOnly && !asteroid?.is_potentially_hazardous_asteroid) return false;
            if(filters.minDiameter != null && diameterKm != null && diameterKm < Number(filters.minDiameter)) return false;
            if(filters.maxDiameter != null && diameterKm != null && diameterKm > Number(filters.maxDiameter)) return false;
            if(filters.minVelocity != null && velocity != null && velocity < Number(filters.minVelocity)) return false;
            if(filters.maxVelocity != null && velocity != null && velocity > Number(filters.maxVelocity)) return false;
            if(filters.minMissDistanceKm != null && missKm != null && missKm < Number(filters.minMissDistanceKm)) return false;
            if(filters.maxMissDistanceKm != null && missKm != null && missKm > Number(filters.maxMissDistanceKm)) return false;
            if(filters.orbitingBody && orbitingBody && orbitingBody !== filters.orbitingBody) return false;

            return true;
        });

        await savedQueries.findOneAndUpdate(
            {userId:user._id},
            {
                userId:user._id,
                name:filters.name || "Last query",
                filters:{
                    minDiameter:filters.minDiameter ?? null,
                    maxDiameter:filters.maxDiameter ?? null,
                    minMissDistanceKm:filters.minMissDistanceKm ?? null,
                    maxMissDistanceKm:filters.maxMissDistanceKm ?? null,
                    hazardousOnly:!!filters.hazardousOnly,
                    minVelocity:filters.minVelocity ?? null,
                    maxVelocity:filters.maxVelocity ?? null,
                    orbitingBody:filters.orbitingBody ?? null,
                    startDate,
                    endDate
                },
                resultCount:filtered.length,
                lastExecutedAt:new Date(),
                createdAt:new Date()
            },
            {upsert:true,new:true}
        );

        return res.json({data:filtered.slice(0,60)});
    }catch(error){
        console.error(error);
        return res.status(500).json({error:{message:"Failed to run research query."}});
    }
}

const getRiskModelsController = async (req,res)=>{
    try{
        const user = req.user;
        if(!user || user.role !== "researcher"){
            return res.status(403).json({error:{message:"Researcher access only"}});
        }
        const doc = await riskModels.findOne({userId:user._id});
        return res.json({data:doc?.models || [], defaultModelId:doc?.defaultModelId || null});
    }catch(error){
        console.error(error);
        return res.status(500).json({error:{message:"Failed to fetch risk models."}});
    }
}

const saveRiskModelController = async (req,res)=>{
    try{
        const user = req.user;
        if(!user || user.role !== "researcher"){
            return res.status(403).json({error:{message:"Researcher access only"}});
        }
        const {
            name,
            weights = {},
            thresholds = {},
            normalizationMethod,
            isDefault
        } = req.body || {};

        const modelId = new mongoose.Types.ObjectId().toString();
        const entry = {
            modelId,
            name: name || "Untitled model",
            weights:{
                diameterWeight:Number(weights.diameterWeight ?? 0),
                velocityWeight:Number(weights.velocityWeight ?? 0),
                distanceWeight:Number(weights.distanceWeight ?? 0),
                moidWeight:Number(weights.moidWeight ?? 0),
                hazardMultiplier:Number(weights.hazardMultiplier ?? 1)
            },
            thresholds:{
                low:Number(thresholds.low ?? 25),
                medium:Number(thresholds.medium ?? 50),
                high:Number(thresholds.high ?? 75)
            },
            normalizationMethod: normalizationMethod || "linear",
            isDefault:!!isDefault,
            createdAt:new Date(),
            updatedAt:new Date()
        };

        const doc = await riskModels.findOne({userId:user._id});
        if(!doc){
            const created = await riskModels.create({
                userId:user._id,
                defaultModelId: entry.isDefault ? entry.modelId : null,
                models:[entry]
            });
            return res.status(201).json({data:entry, defaultModelId:created.defaultModelId});
        }

        if(entry.isDefault){
            doc.models.forEach((m)=>{m.isDefault = false;});
            doc.defaultModelId = entry.modelId;
        }
        doc.models.push(entry);
        await doc.save();

        return res.status(201).json({data:entry, defaultModelId:doc.defaultModelId || null});
    }catch(error){
        console.error(error);
        return res.status(500).json({error:{message:"Failed to save risk model."}});
    }
}

const setDefaultRiskModelController = async (req,res)=>{
    try{
        const user = req.user;
        if(!user || user.role !== "researcher"){
            return res.status(403).json({error:{message:"Researcher access only"}});
        }
        const {modelId} = req.body || {};
        if(!modelId){
            return res.status(400).json({error:{message:"modelId is required"}});
        }
        const doc = await riskModels.findOne({userId:user._id});
        if(!doc){
            return res.status(404).json({error:{message:"No models found"}});
        }
        doc.models.forEach((m)=>{m.isDefault = (m.modelId === modelId);});
        doc.defaultModelId = modelId;
        await doc.save();
        return res.json({message:"Default model updated", defaultModelId:modelId});
    }catch(error){
        console.error(error);
        return res.status(500).json({error:{message:"Failed to set default model."}});
    }
}

module.exports = {feedController,browseController,asteroidDetailController,getWatchlistController,addWatchlistController,researchQueryController,getRiskModelsController,saveRiskModelController,setDefaultRiskModelController};
