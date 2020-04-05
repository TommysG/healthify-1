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

// <----------------- Requests
const user = require('./requests/user'); // all requests regarding the users
const post = require('./requests/post'); // all requests regarding the posts
const reply = require('./requests/reply'); // all requests regarding the replies
// ----------------->

// <------------- Routing

// User
app.get('/api/user/:email', user.getUser); // get a user (obj) by his email
app.post('/api/user', user.createUser); // create a new user (sign up)
app.put('/api/user', user.updateUser); // update an existing user
app.delete('/api/user/:email', user.deleteUser); // delete a user
app.get('/api/users', user.getAllUsers); // get all users (array of objects)
app.post('/api/validate', user.validatePwd); // validate if given password is correct (to loggin)
app.post('/api/changePassword', user.changePwd); // change existing password

// Post
app.post('/api/post', post.createPost); // create a new post
app.get('/api/post/:post_id', post.getPost); // get a post (obj) by its id
app.put('/api/post', post.updatePost); // update a post
app.delete('/api/post/:post_id', post.deletePost); // delete a post
app.get('/api/userPosts/:user_id', post.getAllUserPosts); // get all posts made by one user
app.get('/api/postReplies/:post_id', post.getAllPostReplies); // get all replies under a post
app.post('/api/upvotePost', post.upvote); // upvote a post
app.post('/api/downvotePost', post.downvote); // downvote a post

// Reply
app.post('/api/reply', reply.createReply); // create a new reply
app.get('/api/reply/:reply_id', reply.getReply); // get a reply (obj) by its id
app.put('/api/reply', reply.updateReply); // update a reply
app.delete('/api/reply/:reply_id', reply.deleteReply); // delete a reply
app.post('/api/upvoteReply', reply.upvote); // upvote a reply
app.post('/api/downvoteReply', reply.downvote); // downvote a reply

// Forward unhandled requests (no such endpoint exist on the backend)
app.use('/',(req,res,next)=>{
    res.status(404).send('Page not found!');
})

// -------------->