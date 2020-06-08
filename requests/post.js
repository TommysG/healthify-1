const votes = require('./postvote');
const postSchema = require('../models/post'); // use to validate post requests

// create a new post
const createPost = async (req,res)=>{

    const user_id = req.body.user_id || null;
    const title = req.body.title || null;
    const body = req.body.body || null;
    const category = req.body.category || null;

    try {
        // validate structure of email, username, password, repeatPwd and role
        await postSchema.postSchema.validateAsync({ user_id,title,body,category});
        const sql = `INSERT INTO posts (user_id,title,body,category) VALUES ('${user_id}','${title}','${body}','${category}');`;
        con.query(sql, (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).send('Post could not be created');
            }else{
                if(result.affectedRows>0){
                    console.log("Result: ",result);
                    res.status(201).send('Post successfully created');
                }else if(result.affectedRows=0){
                    res.status(400).send('Post could not be created');
                }
            }
        });
    }catch(err){
        console.log(err)
        res.status(400).send(err.details[0].message);
    }
}

// get a post's data
const getPost = async (req,res)=>{

    const post_id = req.params.post_id;

    const sql = `SELECT * FROM posts WHERE post_id='${post_id}';`;
    con.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send('Error getting the post');
        }else{
            if(result[0]){
                console.log("Result: ",result[0]);
                res.status(200).send(result[0]);
            }else{
                res.status(404).send('Post could not be found');
            }
        }
      });
}

// delete an existing post
const deletePost = (req,res)=>{

    const post_id = req.params.post_id;

    const sql = `DELETE FROM posts WHERE post_id='${post_id}';`;
    con.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send('Error deleting the post');
        }else{
            if(result.affectedRows>0){
                console.log("Result: ",result);
                res.status(200).send('Post successfully deleted');
            }else if(result.affectedRows=0){
                res.status(400).send('Post could not be deleted');
            }
        }
    });
}

// update an existing post's (title, body, category) values
const updatePost= async (req,res)=>{

    const user_id = req.body.user_id || null;
    const post_id = req.body.post_id || null;
    const title = req.body.title || null;
    const body = req.body.body || null;
    const category = req.body.category || null;

    try {
        // validate structure of email, username, password, repeatPwd and role
        await postSchema.postSchema.validateAsync({ user_id,title,body,category});
        const sql = `UPDATE posts SET title='${title}', body='${body}', category='${category}' WHERE post_id='${post_id}';`;
        con.query(sql, (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).send('Error updating the post');
            }else{
                if(result.affectedRows>0){
                    console.log("Result: ",result);
                    res.status(200).send('Post successfully updated');
                }else if(result.affectedRows=0){
                    res.status(400).send('Post could not be updated');
                }
            }
        });
    }catch(err){
        console.log(err)
        res.status(400).send(err.details[0].message);
    }
}

// get all posts made by a user
const getAllUserPosts = (req,res)=>{

    const user_id = req.params.user_id || null;

    const sql = `SELECT * FROM posts WHERE user_id='${user_id}';`;
    con.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send(`Error getting the user's posts`);
        }else{
            if(result[0]){
                console.log("Result: ",result);
                res.status(200).send(result);
            }else{
                res.status(404).send(`No User's posts were found`);
            }
        }
    });
}

// get all replies made on a certain post
const getAllPostReplies = (req,res)=>{

    const post_id = req.params.post_id;

    const sql = `SELECT * FROM replies WHERE post_id='${post_id}';`;
    con.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send(`Error getting the post's replies`);
        }else{
            if(result[0]){
                console.log("Result: ",result);
                res.status(200).send(result);
            }else{
                res.status(404).send(`Post's replies could not be found`);
            }
        }
    });
}

// upvote a post
const upvote = async (req,res)=>{
    
    const user_id = req.body.user_id || null;
    const post_id = req.body.post_id || null;
    const post = await getPostFun(post_id); // get post
    const vote = await votes.getVote(user_id,post_id); // get user's already existing vote (if there is one) on the post
    // if post exists
    if(post){
        let voted = false;
        let totalVotesNew;
        //if user has already voted the post 
        if(vote){
            // if vote is negative or neutral
            if(vote.vote==-1 || vote.vote==0){
                voted = await votes.updateVote(vote.vote_id,1); // update vote to positive
                totalVotesNew = vote.vote==0?post.totalVotes+1:post.totalVotes+2; // if vote was negative add +2 to totalVotes, else if vote was neutral add 1 vote
            }else if(vote.vote==1){ // already upvoted 
                voted = await votes.updateVote(vote.vote_id,0); // update vote to neutral
                totalVotesNew = post.totalVotes-1; // remove a vote from total votes
            }
        // if user has not already voted the reply
        }else{
            voted = await votes.createVote(user_id,post_id,1); // create the vote as positive 
            totalVotesNew = post.totalVotes+1 // add positive vote to totalVotes
        }
        
        // if voted (no errors while creating/updating the user's vote)
        if(voted){
            // update post to the new totalVotes
            const sql = `UPDATE posts SET totalVotes='${totalVotesNew}' WHERE post_id='${post_id}';`;
            con.query(sql, (err, result) => {
                if (err) {
                    console.log(err);
                    res.status(500).send('Error upvoting the post');
                }else{
                    if(result.affectedRows>0){
                        console.log("Result: ",result);
                        res.status(200).send('Post successfully upvoted');
                    }else if(result.affectedRows=0){
                        console.log('0')
                        res.status(400).send('Post could not be upvoted');
                    }
                }
            });
        }else{
            console.log('Post`s vote could not be updated')
            res.status(400).send('Post could not be upvoted');
        }
    }else{
        console.log('Post not found')
        res.status(403).send('Post could not be found');
    }
}

// downvote a reply
const downvote = async (req,res)=>{
    
    const user_id = req.body.user_id || null;
    const post_id = req.body.post_id || null;
    const post = await getPostFun(post_id); // get post
    const vote = await votes.getVote(user_id,post_id);// get user's already existing vote (if there is one) on the post

    // if post was found
    if(post){
        let voted = false;
        let totalVotesNew;
        //if user has already voted the post 
        if(vote){
            // if vote is positive or neutral
            if(vote.vote==1 || vote.vote==0){
                voted = await votes.updateVote(vote.vote_id,-1); // update vote to negative
                totalVotesNew = vote.vote==0?post.totalVotes-1:post.totalVotes-2; // if vote was positive remove -2 to totalVotes, else if vote was neutral remove 1 vote
            }else if(vote.vote==-1){ // already downvoted 
                voted = await votes.updateVote(vote.vote_id,0); // update vote to neutral
                totalVotesNew = post.totalVotes+1; // add a vote to total votes
            }
        // if user has not already voted the post
        }else{
            voted = await votes.createVote(user_id,post_id,-1); // create the vote as negative 
            totalVotesNew = post.totalVotes-1 // add negative vote to totalVotes 
        }

        // if voted (no errors while creating/updating the user's vote)
        if(voted){
            // update reply to the new totalVotes
            const sql = `UPDATE posts SET totalVotes='${totalVotesNew}' WHERE post_id='${post_id}';`;
            con.query(sql, (err, result) => {
                if (err) {
                    console.log(err);
                    res.status(500).send('Error downvoting the post');
                }else{
                    if(result.affectedRows>0){
                        console.log("Result: ",result);
                        res.status(200).send('Post successfully downvoted');
                    }else if(result.affectedRows=0){
                        res.status(400).send('Post could not be downvoted');
                    }
                }
            });
        }else{
            console.log('Post`s vote could not be updated')
            res.status(400).send('Post could not be downvoted');
        }
    }else{
        res.status(404).send('Post could not be found');
    }
}

// get a post by it's id
async function getPostFun(post_id){
    const sql = `SELECT * FROM posts WHERE post_id=${post_id};`;
    const promisePool = pool.promise();
    let rows = await promisePool.query(sql);
    console.log('post is :', rows[0][0])
    return rows[0][0];
}

// get all posts created grouped by their category
const getPostsPerCategory = async (req,res)=>{

    const sql = `SELECT * FROM posts;`;
    con.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send('Error getting the post');
        }else{
            console.log(result)
            if(result){
                // create empty arrays of all post's categories
                let posts = {"Men's health":[],"Women's health":[],"Child's health":[],"General":[],"Mental health":[],"Medicines":[]}
                for(let post of result){
                    let category = post.category;
                    if(!posts[category]) posts[category]=[];
                    // add posts in the category array they fall into
                    posts[category].push(post);
                }
                console.log("Result: ",posts);
                res.status(200).send(posts);
            }else{
                res.status(404).send('Posts could not be found');
            }
        }
    });
}


// get all posts 
const getPosts = async (req,res)=>{

    const sql = `SELECT * FROM posts;`;
    con.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send('Error getting the posts');
        }else{
            console.log(result)
            if(result){
                res.status(200).send(result);
            }else{
                res.status(404).send('Posts could not be found');
            }
        }
    });
}

module.exports = {
    createPost,
    getPost,
    deletePost,
    updatePost,
    getAllUserPosts,
    getAllPostReplies,
    getPostsPerCategory,
    upvote,
    downvote,
    getPosts
}