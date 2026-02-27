import express, { Request, Response } from "express";
import { prisma } from "../db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {authenticateToken, optionalAuthenticateToken} from '../middleware/midd';

interface RegisterBody {
  username?: string;
  email?: string;
  password?: string;
}

interface LoginBody{
  email?: string;
  password?: string;
}

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "ASFAWFAWFWAFAWFAW";
const JWT_EXPIRES_IN="7d";

router.post(
  "/register",
  async function (req: Request<{}, {}, RegisterBody>, res: Response) {
    try {
      const { username, email, password } = req.body;
      
      if (!email || !password || !username) {
        return res.status(400).json({error: "Email, password and username are required"});
      }
      
      const existingUser=await prisma.user.findUnique({
        where:{email}
      });

      if (existingUser){
        return res.status(409).json({error: "User with this email already exists"});
      }

      const hashedPassword=await bcrypt.hash(password,10)

      const newUser = await prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword
        },
        select:{
          id: true,
          username: true,
          email: true,
          createdAt: true
        }
      });

      const token=jwt.sign(
        {userId: newUser.id, email: newUser.email},
        JWT_SECRET,
        {expiresIn: JWT_EXPIRES_IN}
      );

      res.cookie('token', token,{
        httpOnly: true,
        secure: process.env.NODE_ENV==='production',
        maxAge: 7*24*60*60*1000,
        sameSite: 'strict'
      });

      return res.status(201).json({
        message: "User created succesfully",
        user: newUser,
        token
      });
    } catch (e: any){
      console.error("Registration error:", e);
      return res.status(500).json({error: "Internal server error"});
    }
  }
);

router.post(
  "/login",
  async function (req: Request<{}, {}, LoginBody>, res: Response) {
    try {
      const { email, password } = req.body;
      
      if(!email || !password){
        return res.status(400).json({error: "Email and password are required"});
      }

      const user=await prisma.user.findUnique({
        where: {email}
      });

      if(!user){
        return res.status(401).json({error:"Invalid email or password"});
      }

      const isValidPassword=await bcrypt.compare(password, user.password);
      if(!isValidPassword){
        return res.status(401).json({error: "Invalid email or password"});
      }

      const token=jwt.sign(
        {userId: user.id, email: user.email},
        JWT_SECRET,
        {expiresIn: JWT_EXPIRES_IN}
      );

      res.cookie('token', token,{
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: 'strict'
      });

      const{password: _, ...userWithoutPassword}=user;
      return res.status(200).json({
        message: "Login successful",
        user: userWithoutPassword,
        token
      });
    } catch(e: any){
      console.error("Login error:", e);
      return res.status(500).json({error:"Internal server error"});
    }
  }
);

router.post(
  "/logout",
  async function(req,res){
    try{
      res.clearCookie('token',{
        httpOnly: true,
        secure: process.env.NODE_ENV==='production',
        sameSite:'strict'
      });
      return res.status(200).json({message: "Logout successful"});
    } catch(e: any){
      console.error("Logout error:", e);
      return res.status(500).json({error: "Internal server error"});
    }
  });

router.get(
  "/me", 
  async function (req, res) {
  try {
    const user=await prisma.user.findUnique({
      where:{id:req.user!.id},
      select:{
        id:true,
        username:true,
        email:true,
        createdAt:true
      }
    });
    return res.status(200).json({user});
  } catch(error){
    console.error("Error fetching user details:", error);
    return res.status(500).json({error:"Internal server error"});
  }
});

  router.get(
    "/profile",
    optionalAuthenticateToken, async function(req, res){
      if(req.user){
        return res.json({message: "Authenticated", user:req.user});
      } else{
        return res.json({message:"Not authenticated"});
      }
    });

export default router;