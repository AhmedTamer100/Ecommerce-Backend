import mongoose from 'mongoose'

export const Connection=async()=>{
    return await mongoose.connect(process.env.ConnectionDB_URL)
    .then((res)=>console.log('DB Connection Successfully'))
    .catch((err)=>console.log('DB Connection Failed',err))
}