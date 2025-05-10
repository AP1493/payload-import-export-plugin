'use server'


import {getPayload} from "payload"

export const dataFetch = async(config:any,collectionName:string)=>{
    const payload = await getPayload({config})
    const res = payload.find({
        collection:collectionName,
        limit:0,
    })
        return res;
}