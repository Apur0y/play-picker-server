import dotenv from "dotenv";
 
dotenv.config();

interface EnvType {
    PORT:string;
    DB_URL: string;
    NODE_ENV:string;
    SSL_STORE_ID: string;
    SSL_STORE_PASSWORD: string;
    SSL_SESSION_API: string;
    SSL_VALIDATION_API: string;
    SERVER_URL: string;
    FRONTEND_URL: string;
}

const loadEnvVariables=():EnvType=>{

    const requiredEnvVariables:string[]=["DB_URL","NODE_ENV", "SSL_STORE_ID", "SSL_STORE_PASSWORD"];

    requiredEnvVariables.forEach(key=>{
        if(!process.env[key]){
            throw new Error(`Missing required environment ${key}`)
        }
    })

    return {
    PORT : (process.env.PORT || '3000') as string,
    DB_URL: process.env.DB_URL!,
    NODE_ENV: process.env.NODE_ENV!,
    SSL_STORE_ID: process.env.SSL_STORE_ID!,
    SSL_STORE_PASSWORD: process.env.SSL_STORE_PASSWORD!,
    SSL_SESSION_API: (process.env.SSL_SESSION_API || 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php') as string,
    SSL_VALIDATION_API: (process.env.SSL_VALIDATION_API || 'https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php') as string,
    SERVER_URL: (process.env.SERVER_URL || 'http://localhost:1000') as string,
    FRONTEND_URL: (process.env.FRONTEND_URL || 'http://localhost:3000') as string,
}
}

export const envVars=loadEnvVariables();