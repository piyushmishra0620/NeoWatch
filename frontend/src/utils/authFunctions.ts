import { api } from "@/lib/api";

export async function signup(body: {
  name: string;
  email: string;
  password: string;
  role: string;
  institution?: string;
  specialization?: string;
}) {
    try{
        const response = await api.post("/auth/signup",body);
        return {data:response.data,status:response.status};
    }catch(err:any){
        console.error(err);
        return {error:(err.response?.data.error || err.request?.message || err.message)}
    }
}

export async function login(body:{email:string,password:string,role:string}){
    try{
        const response = await api.post("/auth/login",body);
        return {data:response.data,status:response.status};
    }catch(err:any){
        console.error(err);
        return {error:(err.response?.data.error || err.request?.message || err.message)}
    }
}

export async function getUser(){
    try{
        const response = await api.get("/auth/getUser");
        if(response.status==200){
            return  response.data;
        }
    }catch(err:any){
        console.error(err);
        return {error:(err.response?.data.error || err.request?.message || err.message )}
    }
}

export async function logout(){
    try{
        const response = await api.delete("/auth/logout");
        return response.data;
    }catch(err:any){
        console.error(err);
        return {error:( err.response?.data.error || err.request?.message || err.message),status:(err.response?.data.status || err.request?.status || err.status)}
    }
}
