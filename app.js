/*
    *** Healthify Backend ***

    An application created by:
    --- Kyriakos Giarimagas
    --- Thomas Giannakos
    --- Eleftherios Palaiochoritis
    --- Lambros Kolovos
*/

// <------- Nessessary imports and configuration for express
const express = require('express'); // import 'express' web application framework
const cors = require('cors'); // makes requests to the Rest API possible
const app = express(); // initialize express app
require('./functions/mysql-conn'); // use mysql-conn to connect to the app database
require('dotenv/config') // use 'dotenv' module to hide important environmental variables in the .env file instead of exposing them to the app
const bodyParser = require('body-parser') // use to handle the imput of requests
app.use(bodyParser.json()); // set json as the format when parsing request bodies 
app.use(cors()); // initialize cors
// app.use(express.static(path.join(__dirname, 'files'))); // use to access files with static path
const PORT = process.env.PORT; // set the backend port (3100 because the 3000 is also default to React) 
app.listen(PORT, ()=>{ // server listens on the port
    console.log(`Listening on port ${PORT}`)
});
// --------->

// <------------- Routing

// User
const userRoute = require('./routing/user');
userRoute(app);

// Post
const postRoute = require('./routing/post');
postRoute(app);

// Reply
const replyRoute = require('./routing/reply');
replyRoute(app);

// Poll
const pollRoute = require('./routing/poll');
pollRoute(app);

// Forward unhandled requests (no such endpoint exist on the backend)
app.use('/',(req,res,next)=>{
    res.status(404).send('Page not found!');
})

// -------------->