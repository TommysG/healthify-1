const votes = require('./postvote');

const createPost = async (req,res)=>{

    const user_id = req.body.user_id || null;
    const title = req.body.title || null;
    const body = req.body.body || null;
    const category = req.body.category || null;

    const sql = `INSERT INTO posts (user_id,title,body,category) VALUES ('${user_id}','${title}','${body}','${category}');`;

    console.log('//////')
    console.log(sql)
    con.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send('Post could not be created');
        }else{
            if(result.affectedRows>0){
                console.log("Result: ",result);
                res.status(201).send('Post successfully created');
            }else{
                res.status(400).send('Post could not be created');
            }
        }
    });
}

const getPost = async (req,res)=>{
    const post_id = req.params.post_id;
    const sql = `SELECT * FROM posts WHERE post_id='${post_id}';`;

    console.log('//////')
    console.log(sql)
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

const deletePost = (req,res)=>{
    const post_id = req.params.post_id;
    const sql = `DELETE FROM posts WHERE post_id='${post_id}';`;

    console.log('//////')
    console.log(sql)
    con.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send('Error deleting the post');
        }else{
            if(result.affectedRows>0){
                console.log("Result: ",result);
                res.status(200).send('Post successfully deleted');
            }else{
                res.status(400).send('Post could not be deleted');
            }
        }
    });
}

const updatePost= (req,res)=>{
    const post_id = req.body.post_id || null;
    const title = req.body.title || null;
    const body = req.body.body || null;
    const category = req.body.category || null;

    const sql = `UPDATE posts SET title='${title}', body='${body}', category='${category}' WHERE post_id='${post_id}';`;
    con.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send('Error updating the post');
        }else{
            if(result.affectedRows>0){
                console.log("Result: ",result);
                res.status(200).send('Post successfully updated');
            }else{
                res.status(400).send('Post could not be updated');
            }
        }
    });
}

const getAllUserPosts = (req,res)=>{

    const user_id = req.params.user_id || null;
    const sql = `SELECT * FROM posts WHERE user_id='${user_id}';`;

    console.log('//////')
    console.log(sql)
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

const getAllPostReplies = (req,res)=>{

    const post_id = req.params.post_id;
    const sql = `SELECT * FROM replies WHERE post_id='${post_id}';`;

    console.log('//////')
    console.log(sql)
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

const upvote = async (req,res)=>{
    
    const user_id = req.body.user_id || null;
    const post_id = req.body.post_id || null;
    const post = await getPostFun(post_id);
    const vote = await votes.getVote(user_id,post_id);
    console.log('vote : ',vote)
    console.log('post : ',post)
    if(post){
        let voted = false;
        let totalVotesNew;
        if(vote){
            if(vote.vote==-1 || vote.vote==0){
                voted = await votes.updateVote(vote.vote_id,1);
                totalVotesNew = vote.vote==0?post.totalVotes+1:post.totalVotes+2; // if from -vote to +vote -> totalVotes +2, if from 0vote to +vote -> totalVotes +1
            }else if(vote.vote==1){ // already upvoted --> remove vote
                voted = await votes.updateVote(vote.vote_id,0);
                totalVotesNew = post.totalVotes-1; // remove a +vote -> totalVotes -1
            }
        }else{
            voted = await votes.createVote(user_id,post_id,1);
            totalVotesNew = post.totalVotes+1 // from 0vote to +vote -> totalVotes +1
        }
        console.log('total votes new : ',totalVotesNew)
        if(voted){
            const sql = `UPDATE posts SET totalVotes='${totalVotesNew}' WHERE post_id='${post_id}';`;
            con.query(sql, (err, result) => {
                if (err) {
                    console.log(err);
                    res.status(500).send('Error upvoting the post');
                }else{
                    if(result.affectedRows>0){
                        console.log("Result: ",result);
                        res.status(200).send('Post successfully upvoted');
                    }else{
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

const downvote = async (req,res)=>{
    
    const user_id = req.body.user_id || null;
    const post_id = req.body.post_id || null;
    const post = await getPostFun(post_id);
    const vote = await votes.getVote(user_id,post_id);
    console.log('vote : ',vote)
    console.log('post : ',post)

    if(post){
        let voted = false;
        let totalVotesNew;
        if(vote){
            if(vote.vote==1 || vote.vote==0){
                voted = await votes.updateVote(vote.vote_id,-1);
                totalVotesNew = vote.vote==0?post.totalVotes-1:post.totalVotes-2; // if from +vote to -vote -> totalVotes -2, if from 0vote to -vote -> totalVotes -1
            }else if(vote.vote==-1){ // already downvoted --> remove vote
                voted = await votes.updateVote(vote.vote_id,0);
                totalVotesNew = post.totalVotes+1; // remove a -vote -> totalVotes +1
            }
        }else{
            voted = await votes.createVote(user_id,post_id,-1);
            totalVotesNew = post.totalVotes-1 // from 0vote to -vote -> totalVotes -1
        }

        console.log('voted is : ',voted)
        if(voted){
            const sql = `UPDATE posts SET totalVotes='${totalVotesNew}' WHERE post_id='${post_id}';`;
            con.query(sql, (err, result) => {
                if (err) {
                    console.log(err);
                    res.status(500).send('Error downvoting the post');
                }else{
                    if(result.affectedRows>0){
                        console.log("Result: ",result);
                        res.status(200).send('Post successfully downvoted');
                    }else{
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

async function getPostFun(post_id){
    const sql = `SELECT * FROM posts WHERE post_id=${post_id};`;
    const promisePool = pool.promise();
    let rows = await promisePool.query(sql);
    console.log('post is :', rows[0][0])
    return rows[0][0];
}

module.exports = {
    createPost,
    getPost,
    deletePost,
    updatePost,
    getAllUserPosts,
    getAllPostReplies,
    upvote,
    downvote
}