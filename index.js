// require('dotenv').config({path:'./env'})
import dotenv from "dotenv"
import connectDB from './db/index.js'
import { app } from './app.js'
dotenv.config({
    path:'./env'
})
connectDB()
.then(()=>{
    app.listen(process.env.PORT || 7000,()=>{
        console.log(`Server is running at port : ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("MongoDB connection failed !!!",err)
})