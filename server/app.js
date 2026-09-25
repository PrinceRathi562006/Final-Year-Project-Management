const express = require('express');
const cors = require('cors');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const {errorMiddleware} = require('./middlewares/error');
const authRouter = require('./router/userRoute.js');
const adminRouter = require('./router/adminRoutes.js')

const app = express();

app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
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
