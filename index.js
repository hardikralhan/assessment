const express = require("express");
const app = express();
const cors = require("cors")
const {
    Alchemy,
    Network
} = require('alchemy-sdk');
const dotenv = require("dotenv");
dotenv.config({
    silent: process.env.NODE_ENV === 'production'
});
const reportRoutes = require('./routes/reports')

app.options("*", cors({
    origin: '*',
    optionsSuccessStatus: 200
}));
app.use(cors({
    origin: "*",
    optionsSuccessStatus: 200
}));
app.use(express.json())

app.use('/', reportRoutes)

//START SERVER
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`[SERVER STARTED] Listening to port [${port}]`);
});

module.exports = server;