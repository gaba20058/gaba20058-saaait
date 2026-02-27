import {Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';
import {prisma} from '../db';

const JWT_SECRET=process.env.JWT_SECRET|| "ASFAWFAWFWAFAWFAW";

declare global{
    namespace Express{
        interface Request{
            user?: {
                id: number;
                email: string;
            };
        }
    }
}

export interface TokenPayLoad{
    userId: number;
    email: string;
}

export const authenticateToken = async(
    req: Request,
    res: Response,
    next: NextFunction
)=>{
    try{
        const token=req.cookies.token||req.headers.authorization?.split(' ')[1];
        if(!token){
            return res.status(401).json({error:"Not authenticated"});
        }
        const decoded = jwt.verify(token, JWT_SECRET) as TokenPayLoad;
        const user=await prisma.user.findUnique({
            where:{id:decoded.userId},
            select:{
                id:true,
                email:true,
                username:true
            }
        });
        if(!user){
            return res.status(401).json({error:"User not found"});
        }
        req.user={
            id:user.id,
            email:user.email
        };
        next();
    } catch(error: any){
        if(error.name==='JsonWebTokenError'){
            return res.status(401).json({error:"Invalid token"});
        }
        if(error.name==='TokenExpiredError'){
            return res.status(401).json({error:"Token expired"});
        }
        console.error("Auth middleware error:", error);
        return res.status(500).json({error:"Internal server"});
    }
};

export const optionalAuthenticateToken=async(
    req: Request,
    res: Response,
    next: NextFunction
)=>{
    try{
        const token=req.cookies.token||req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET) as TokenPayLoad;
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true }
      });
      if (user) {
        req.user = {
          id: user.id,
          email: user.email
        };
      }
    }
    next();
  } catch (error) {
    next();
  }
};