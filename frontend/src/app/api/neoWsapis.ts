import axios from "axios";

export const fetchNearAsteroids = async (data:{startDate:Date,endDate:Date})=>{
    try{
        const startDate = data.startDate ?? new Date();
        const endDate = data.endDate ?? new Date();
        const safeStart = new Date(startDate);
        const safeEnd = new Date(endDate);
        if (safeEnd.getTime() - safeStart.getTime() > 6 * 24 * 60 * 60 * 1000) {
            safeEnd.setTime(safeStart.getTime() + 6 * 24 * 60 * 60 * 1000);
        }
        const response = await axios.get("http://localhost:3000/api/recents",{
            params:{
                startDate:safeStart.toISOString().slice(0,10),
                endDate:safeEnd.toISOString().slice(0,10)
            }
        });
        const res = response.data;
        const AsteroidsData = res.data;
        return {data:AsteroidsData};
    }catch(error:any){
        console.log(error);
        throw new Error(error);
    }
}

export const fetchAsteroidById = async (id:string)=>{
    try{
        const response = await axios.get(`http://localhost:3000/api/asteroid/${id}`);
        return response.data?.data ?? response.data;
    }catch(error:any){
        console.log(error);
        throw new Error(error);
    }
}

export const addToWatchlist = async (payload:{
    asteroidId:string,
    name?:string,
    hazardous?:boolean,
    lastKnownRiskScore?:number,
    nextCloseApproachDate?:string | Date | null,
    nextMissDistanceKm?:number | null
})=>{
    try{
        const response = await axios.post("http://localhost:3000/api/watchlist",payload,{
            withCredentials:true
        });
        return response.data;
    }catch(error:any){
        console.log(error);
        throw new Error(error);
    }
}

export const fetchWatchlist = async ()=>{
    try{
        const response = await axios.get("http://localhost:3000/api/watchlist",{
            withCredentials:true
        });
        return response.data?.data ?? response.data;
    }catch(error:any){
        console.log(error);
        throw new Error(error);
    }
}

export const runResearchQuery = async (payload:{
    startDate?:string,
    endDate?:string,
    filters:{
        name?:string,
        minDiameter?:number,
        maxDiameter?:number,
        minMissDistanceKm?:number,
        maxMissDistanceKm?:number,
        hazardousOnly?:boolean,
        minVelocity?:number,
        maxVelocity?:number,
        orbitingBody?:string
    }
})=>{
    try{
        const response = await axios.post("http://localhost:3000/api/research/query",payload,{
            withCredentials:true
        });
        return response.data?.data ?? response.data;
    }catch(error:any){
        console.log(error);
        throw new Error(error);
    }
}

export const fetchRiskModels = async ()=>{
    try{
        const response = await axios.get("http://localhost:3000/api/research/risk-models",{
            withCredentials:true
        });
        return response.data;
    }catch(error:any){
        console.log(error);
        throw new Error(error);
    }
}

export const saveRiskModel = async (payload:{
    name?:string,
    weights:{
        diameterWeight?:number,
        velocityWeight?:number,
        distanceWeight?:number,
        moidWeight?:number,
        hazardMultiplier?:number
    },
    thresholds:{
        low?:number,
        medium?:number,
        high?:number
    },
    normalizationMethod?:string,
    isDefault?:boolean
})=>{
    try{
        const response = await axios.post("http://localhost:3000/api/research/risk-models",payload,{
            withCredentials:true
        });
        return response.data;
    }catch(error:any){
        console.log(error);
        throw new Error(error);
    }
}

export const setDefaultRiskModel = async (modelId:string)=>{
    try{
        const response = await axios.post("http://localhost:3000/api/research/risk-models/default",{modelId},{
            withCredentials:true
        });
        return response.data;
    }catch(error:any){
        console.log(error);
        throw new Error(error);
    }
}
