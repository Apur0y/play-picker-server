
import express, { Request, Response } from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
// import { UserRoutes } from "./app/modules/user/user.route";

import { router } from "./app/routes";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";



export const app=express();
app.use(cors({
  origin: ['http://localhost:3000', 'https://playpicker.vercel.app'], 
  credentials: true // Allow cookies to be sent
}))
app.use(express.json());
app.use(cookieParser());

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1",router)


app.get("/", (req: Request, res: Response) => {
        res.status(200).json({
             message: "Play picker in online"
        })
    }) 


  app.use(globalErrorHandler);
  // module.exports = app;