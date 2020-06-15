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
                res.status(500).send({error:'Post could not be created'});
            }else{
                if(result.affectedRows>0){
                    console.log("Result: ",result);
                    res.status(201).send('Post successfully created');
                }else if(result.affectedRows=0){
                    res.status(400).send({error:'Post could not be created'});
                }
            }
        });
    }catch(err){
        console.log(err)
        res.status(400).send({error:err.details[0].message});
    }
}

// get a post's data
const getPost = async (req,res)=>{

    const post_id = req.params.post_id;

    const sql = `SELECT * FROM posts WHERE post_id='${post_id}';`;
    con.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send({error:'Error getting the post'});
        }else{
            if(result[0]){
                console.log("Result: ",result[0]);
                res.status(200).send(result[0]);
            }else{
                res.status(404).send({error:'Post could not be found'});
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
            res.status(500).send({error:'Error deleting the post'});
        }else{
            if(result.affectedRows>0){
                console.log("Result: ",result);
                res.status(200).send('Post successfully deleted');
            }else if(result.affectedRows=0){
                res.status(400).send({error:'Post could not be deleted'});
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
                res.status(500).send({error:'Error updating the post'});
            }else{
                if(result.affectedRows>0){
                    console.log("Result: ",result);
                    res.status(200).send('Post successfully updated');
                }else if(result.affectedRows=0){
                    res.status(400).send({error:'Post could not be updated'});
                }
            }
        });
    }catch(err){
        console.log(err)
        res.status(400).send({error:err.details[0].message});
    }
}

// get all posts made by a user
const getAllUserPosts = (req,res)=>{

    const user_id = req.params.user_id || null;

    const sql = `SELECT * FROM posts WHERE user_id='${user_id}';`;
    con.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send({error:`Error getting the user's posts`});
        }else{
            if(result[0]){
                console.log("Result: ",result);
                res.status(200).send(result);
            }else{
                res.status(404).send({error:`No User's posts were found`});
            }
        }
    });
}

// get all replies made on a certain post
const getAllPostReplies = async (req,res)=>{

    const post_id = req.params.post_id;

    const sql = `SELECT * FROM replies WHERE post_id='${post_id}';`;
    const promisePool = pool.promise();

    try{
        let replies = await promisePool.query(sql);
        if(replies){
            replies = replies[0]
            let repliesFinal = [];
            for(let reply of replies){
                let sql = `SELECT COUNT(*) as Count FROM replyvotes WHERE reply_id='${reply.reply_id}';`;
                repliesVotes = await promisePool.query(sql);
                reply.votes = repliesVotes[0][0].Count;
                repliesFinal.push(reply)
            }
            res.status(200).send(repliesFinal)
        }else{
            res.status(404).send({error:`Post's replies could not be found`});
        }
    }catch(err){
        console.log(err)
        res.status(500).send({error:`Error getting the post's replies`});
    }
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
                    res.status(500).send({error:'Error upvoting the post'});
                }else{
                    if(result.affectedRows>0){
                        console.log("Result: ",result);
                        res.status(200).send('Post successfully upvoted');
                    }else if(result.affectedRows=0){
                        console.log('0')
                        res.status(400).send({error:'Post could not be upvoted'});
                    }
                }
            });
        }else{
            console.log('Post`s vote could not be updated')
            res.status(400).send({error:'Post could not be upvoted'});
        }
    }else{
        console.log('Post not found')
        res.status(403).send({error:'Post could not be found'});
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
                    res.status(500).send({error:'Error downvoting the post'});
                }else{
                    if(result.affectedRows>0){
                        console.log("Result: ",result);
                        res.status(200).send('Post successfully downvoted');
                    }else if(result.affectedRows=0){
                        res.status(400).send({error:'Post could not be downvoted'});
                    }
                }
            });
        }else{
            console.log('Post`s vote could not be updated')
            res.status(400).send({error:'Post could not be downvoted'});
        }
    }else{
        res.status(404).send({error:'Post could not be found'});
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
const getPostsCountPerCategory = async (req,res)=>{

    const sql = `SELECT sum(case when p.category = 'Men''s health' then 1 else 0 end) as mensHealthCount,
    sum(case when p.category='Women''s health' then 1 else 0 end) as womensHealthCount, 
    sum(case when p.category='Child''s health' then 1 else 0 end) as childsHealthCount, 
    sum(case when p.category='General' then 1 else 0 end) as generalCount, 
    sum(case when p.category='Mental health' then 1 else 0 end) as mentalHealthCount, 
    sum(case when p.category='Medicines' then 1 else 0 end) as medicinesHealthCount
    FROM posts p`

    con.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send({error:'Error getting the post'});
        }else{
            console.log(result)
            if(result){
                res.status(200).send(result[0]);
            }else{
                res.status(404).send({error:'Posts could not be found'});
            }
        }
    });
}


// get all posts with the number of replies each one has 
const getPosts = async (req,res)=>{
    let sql = `SELECT * FROM posts`;
    const promisePool = pool.promise();
    try{
        let posts = await promisePool.query(sql);
        if(posts){
            posts = posts[0]
            let postsFinal = [];
            for(let post of posts){
                let sql = `SELECT COUNT(*) as Count FROM replies WHERE post_id='${post.post_id}';`;
                postReplies = await promisePool.query(sql);
                post.repliesNum = postReplies[0][0].Count;
                postsFinal.push(post)
            }
            res.status(200).send(postsFinal);
        }else{
            res.status(404).send({error:'Posts could not be found'});
        }
    }catch(err){
        console.log(err);
        res.status(500).send({error:'Error getting the posts'});
    }
}

// get all posts of a given category
const getPostsPerCategory = async (req,res)=>{
    const category = await postCategoryByCode(req.params.category);
    let sql = `SELECT * FROM posts WHERE category like '${category}%'`;
    con.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send({error:'Error getting the post'});
        }else{
            console.log(result)
            if(result){
                res.status(200).send(result);
            }else{
                res.status(404).send({error:'Posts could not be found'});
            }
        }
    });
}


// get all votes of a user per post 
const getUserPostsVotes = async (req,res)=>{
    let sql = `SELECT * FROM postvotes WHERE user_id='${req.params.user_id}'`;
    con.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send({error:'Error getting the post'});
        }else{
            console.log(result)
            if(result){
                res.status(200).send(result);
            }else{
                res.status(404).send({error:'Posts could not be found'});
            }
        }
    });
}

// get all replies' votes of a user per post 
const getUserPostVotes = async (req,res)=>{
    let sql = `SELECT rv.reply_id, rv.user_id, rv.reply_id, rv.vote FROM replyvotes rv JOIN replies r ON rv.reply_id = r.reply_id  WHERE rv.user_id='${req.query.user_id}' AND r.post_id='${req.query.post_id}'`;
    con.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send({error:'Error getting the post'});
        }else{
            console.log(result)
            if(result){
                res.status(200).send(result);
            }else{
                res.status(404).send({error:'Posts could not be found'});
            }
        }
    });
}

function postCategoryByCode(code) {
    switch(parseInt(code)){
        case 0:
            return `Men`;
        case 1:
            return `Women`;
        case 3:
            return `Child`;
        case 4:
            return `General`;
        case 5:
            return `Mental`;
        case 6:
            return `Medicine`;
    }
}

module.exports = {
    createPost,
    getPost,
    deletePost,
    updatePost,
    getAllUserPosts,
    getAllPostReplies,
    getPostsCountPerCategory,
    getPostsPerCategory,
    upvote,
    downvote,
    getPosts,
    getUserPostsVotes,
    getUserPostVotes
}