const post = require('../requests/post');

function route(app) {
    app.post('/api/post', post.createPost); // create a new post
    app.get('/api/post/:post_id', post.getPost); // get a post (obj) by its id
    app.put('/api/post', post.updatePost); // update a post
    app.delete('/api/post/:post_id', post.deletePost); // delete a post
    app.get('/api/userPosts/:user_id', post.getAllUserPosts); // get all posts made by one user
    app.get('/api/postReplies/:post_id', post.getAllPostReplies); // get all replies under a post
    app.post('/api/upvotePost', post.upvote); // upvote a post
    app.post('/api/downvotePost', post.downvote); // downvote a post
    app.get('/api/postsPerCategory', post.getPostsPerCategory); // get all posts per category
    app.get('/api/posts', post.getPosts); // get all posts 
}

module.exports = route;