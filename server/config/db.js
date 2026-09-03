const mongoose = require('mongoose')

const connectDB = async () => {
    mongoose.connect(process.env.MONGO_URI, {
        dbName: "final_year_project_management_system"
    })
    .then(()=>{
        console.log("Connected to DataBase👍");
    }).catch((err) => {
        console.log("DataBase connection failed.", err.message);
    });
};

module.exports = connectDB;