const express = require('express');
const cors = require('cors');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const {errorMiddleware} = require('./middlewares/error');
const authRouter = require('./router/userRoute.js');
const adminRouter = require('./router/adminRoutes.js')

const app = express();

const allowedOrigins = new Set([
    "http://localhost:5173",
    "https://final-year-project-management-gamma.vercel.app",
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL.replace(/\/$/, "")] : []),
]);

app.use(
    cors({
        origin: (origin, callback) => {
            // Requests without an Origin header (such as health checks) are allowed.
            if (!origin || allowedOrigins.has(origin.replace(/\/$/, ""))) {
                return callback(null, true);
            }
            return callback(new Error("Origin not allowed by CORS"));
        },
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(("/api/v1/auth"), authRouter);
app.use(("/api/v1/admin"), adminRouter);

// use in last
app.use(errorMiddleware);

module.exports = app;
