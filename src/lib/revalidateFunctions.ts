"use server"
import { revalidatePath } from "next/cache.js"

export const revalidateFunction = async({segments}:any)=>{
 revalidatePath(`/${segments}`)
}