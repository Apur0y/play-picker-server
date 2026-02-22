import { envVars } from "./env";

const config = {
  env: envVars.NODE_ENV || "development",
  port: envVars.PORT || "3000",
  database: {
    url: envVars.DB_URL,
  },
  jwt: {
    access: {
      secret: process.env.JWT_ACCESS_SECRET || "your-access-token-secret",
      expiresIn: process.env.JWT_ACCESS_EXPIRY || "7d",
    },
    refresh: {
      secret: process.env.JWT_REFRESH_SECRET || "your-refresh-token-secret",
      expiresIn: process.env.JWT_REFRESH_EXPIRY || "30d",
    },
    resetPassword: {
      expiresIn: process.env.JWT_RESET_PASSWORD_EXPIRY || "1h",
    },
  },
  url: {
    frontend: process.env.FRONTEND_URL || "http://localhost:3000",
    backend: process.env.SERVER_URL || "http://localhost:1000",
  },
  verify: {
    email: process.env.VERIFY_EMAIL_URL || `${process.env.SERVER_URL}/api/auth/verify-email`,
    resetPassLink: process.env.RESET_PASSWORD_URL || `${process.env.SERVER_URL}/api/auth/verify-reset-password`,
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || "your-google-client-id",
  },
  ssl: {
    storeId: envVars.SSL_STORE_ID,
    storePassword: envVars.SSL_STORE_PASSWORD,
    sessionApi: envVars.SSL_SESSION_API,
    validationApi: envVars.SSL_VALIDATION_API,
  },
};

export default config;
