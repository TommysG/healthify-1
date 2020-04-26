// <------- Nessessary imports and configuration for express
const express = require('express'); // import 'express' web application framework
const app = express(); 
require('./functions/mysql-conn'); // use mysql-conn to connect to the app database
require('dotenv/config') // use 'dotenv' module to hide important environmental variables in the .env file instead of exposing them to the app
const bodyParser = require('body-parser') // use to handle the imput of requests
app.use(bodyParser.json()); 
// app.use(express.static(path.join(__dirname, 'files'))); // use to access files with static path
const PORT = process.env.PORT; // set the backend port (3000) 
app.listen(PORT, ()=>{ 
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

// Forward unhandled requests (no such endpoint exist on the backend)
app.use('/',(req,res,next)=>{
    res.status(404).send('Page not found!');
})

// -------------->