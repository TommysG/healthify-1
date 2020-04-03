const express = require('express');
const app = express();
require('./functions/mysql-conn');

let bodyParser = require('body-parser')
app.use( bodyParser.json() ); 

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, ()=>{console.log(`Listening on port ${PORT}`)});

// <----------------- Routing
const user = require('./requests/user');
const post = require('./requests/post');
const reply = require('./requests/reply');

// ----------------->

// <------------- Endpoints

// User
app.get('/api/user/:user', user.getUser);
app.post('/api/user', user.createUser);
app.put('/api/user', user.updateUser);
app.delete('/api/user/:user', user.deleteUser);
app.get('/api/users', user.getAllUsers);

// Post
app.post('/api/post', post.createPost);
app.get('/api/post/:post_id', post.getPost);
app.put('/api/post', post.updatePost);
app.delete('/api/post/:post_id', post.deletePost);
app.get('/api/userPosts/:user_id', post.getAllUserPosts);
app.get('/api/postReplies/:post_id', post.getAllPostReplies);
app.post('/api/upvotePost', post.upvote);
app.post('/api/downvotePost', post.downvote);

// Reply
app.post('/api/reply', reply.createReply);
app.get('/api/reply/:reply_id', reply.getReply);
app.put('/api/reply', reply.updateReply);
app.delete('/api/reply/:reply_id', reply.deleteReply);
app.post('/api/upvoteReply', reply.upvote);
app.post('/api/downvoteReply', reply.downvote);

// Forward unhandled requests
app.use('/',(req,res,next)=>{
    res.status(404).send('Page not found!');
})
// -------------->

/* //// CRUD
app.post
app.get
app.put
app.delete
*/

/*
req.params.uriParam
req.query.queryParam
*/

/*
res.sendFile('./filePath');
res.json(param)
*/

/*
npm joi for values validation
*/