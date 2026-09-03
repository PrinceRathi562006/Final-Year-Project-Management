const mongoose = require('mongoose');

const connectDB = async () => {
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is not defined in server/.env");
    }

    try {
        const connection = await mongoose.connect(process.env.MONGO_URI, {
            dbName: "final_year_project_management_system",
            serverSelectionTimeoutMS: 10000,
        });

        console.log(`Connected to DataBase: ${connection.connection.host}`);
    } catch (err) {
        console.error("DataBase connection failed.", err.message);
        throw err;
    }
};

module.exports = connectDB;
