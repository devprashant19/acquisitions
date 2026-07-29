import aj from "#config/arcjet.js";
import logger from "#config/logger.js"; 
import { slidingWindow } from "@arcjet/node";
 
const securityMiddleware = async(req, res, next) => {
    try{
        const role=req.user?.role||'guest';
        let limit;
        let message;
        switch(role){
            case 'admin':
                limit=20
                message="Admin rate limit exceeded"
                break;
            case 'user':
                limit=10
                message="User rate limit exceeded"
                break;
            default:
                limit=5
                message="Guest rate limit exceeded"
                break;
        }
        const client=aj.withRule(slidingWindow({mode:"LIVE",interval:'1m',max:limit,name:`${role}_rate_limit`}));
        const decision=await client.protect(req);
        if(decision.isDenied() && decision.reason.isBot()){
            logger.warn("Bot Request detected",{ip:req.ip,method:req.method,url:req.originalUrl})
            res.status(403).json({error:'Forbidden',message:'Bot request detected'})
        }
        if(decision.isDenied() && decision.reason.isShield()){
            logger.warn("Shield Request detected",{ip:req.ip,method:req.method,url:req.originalUrl})
            res.status(425).json({error:'Too Early',message:'Shield request detected'})
        }
        if(decision.isDenied() && decision.reason.isRateLimit()){
            logger.warn("Rate Limit Request detected",{ip:req.ip,method:req.method,url:req.originalUrl})
            res.status(429).json({error:'Too Many Requests',message:message})
        }
        

        next();
    }catch(e){
        logger.error("Arcjet middleware error: ",e,{ip:req.ip,method:req.method,url:req.originalUrl})
        res.status(500).json({error:'Internal Server Error',message:"Something went wrong while processing the request."})
    }
};
export default securityMiddleware;