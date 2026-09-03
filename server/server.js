const connectDB = require('./config/db.js');
const app = require("./app.js");

const dns = require('dns');
dns.setServers([
    "8.8.8.8",
    "1.1.1.1"
])

// -------------------
// DataBase Connection
// -------------------

connectDB();

// -------------------
// Start Server
// -------------------

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, ()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
});


// -------------------
// error handling
// -------------------

process.on("unhandledRejection", (err) => {
    console.error(`Unhandled Rejection: ${err.message}`);
    server.close(()=> process.exit(1));
});

process.on("uncaughtException", (err) => {
    console.error(`Uncaught exception: ${err.message}`);
    process.exit(1);
});

module.exports = server;
