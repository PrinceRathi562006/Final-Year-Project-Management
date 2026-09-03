require('dotenv').config();
const dns = require('dns');

dns.setServers([
    "1.1.1.1",
    "8.8.8.8",
]);

if (typeof dns.setDefaultResultOrder === 'function') {
    dns.setDefaultResultOrder('ipv4first');
}

const connectDB = require('./config/db.js');
const app = require("./app.js");

// -------------------
// DataBase Connection
// -------------------

const PORT = process.env.PORT || 4000;
let server;

const startServer = async () => {
    await connectDB();

    // -------------------
    // Start Server
    // -------------------

    server = app.listen(PORT, ()=>{
        console.log(`Server is running on http://localhost:${PORT}`);
    });
};

startServer().catch((err) => {
    console.error(`Server startup failed: ${err.message}`);
    process.exit(1);
});


// -------------------
// error handling
// -------------------

process.on("unhandledRejection", (err) => {
    console.error(`Unhandled Rejection: ${err.message}`);
    if (server) {
        server.close(()=> process.exit(1));
    } else {
        process.exit(1);
    }
});

process.on("uncaughtException", (err) => {
    console.error(`Uncaught exception: ${err.message}`);
    process.exit(1);
});

module.exports = server;
