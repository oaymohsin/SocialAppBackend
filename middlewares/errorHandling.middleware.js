import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";

export function errorHandler(err,req,res,next){
    if(err instanceof apiError){
        res.status(err.statusCode).json(new apiResponse(err.statusCode,err.errors,err.message))
    }
    else{
        throw err
        // res.status(err.statusCode || 500).json(new apiResponse(err.statusCode || 500,null,"internal Serversss Error"))
    }
}