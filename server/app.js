const express = require('express');
const cors = require('cors');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const {errorMiddleware} = require('./middlewares/error');
const authRouter = require('./router/userRoute.js');
const adminRouter = require('./router/adminRoutes.js')
const studentRouter = require('./router/studentRoutes.js')
const {fileURLToPath} = require("url");
const path = require("path");

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.__dirname(__filename);

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

const uploadsDir = path.join(__dirname, "../uploads");
const tempDir = path.join(__dirname, "temp");

if(!fs.existsSync(uploadDir)) fs.mkdirSYNC(uploadsDir, {recursive: true});
if(!fs.existsSync(tempDir)) fs.mkdirSYNC(tempDir, {recursive: true});

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(("/api/v1/auth"), authRouter);
app.use(("/api/v1/admin"), adminRouter);
app.use(("/api/v1/student"), studentRouter);

// use in last
app.use(errorMiddleware);

module.exports = app;
