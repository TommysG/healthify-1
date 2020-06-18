const votes = require('./replyvote');
// const path = require('path');

// create a new reply
const createReply = async (req,res)=>{

    const user_id = req.body.user_id || null;
    const post_id = req.body.post_id || null;
    const comment = req.body.comment || null;

    const sql = `INSERT INTO replies (user_id,post_id,comment) VALUES ('${user_id}','${post_id}','${comment}');`;
    con.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send({error:'Reply could not be created'});
        }else{
            if(result.affectedRows>0){
                console.log("Result: ",result);
                res.status(201).send('Reply successfully created');
            }else if(result.affectedRows=0){
                res.status(400).send({error:'Reply could not be created'});
            }
        }
    });
}

// get a reply by it's id
const getReply = async (req,res)=>{

    const reply_id = req.params.reply_id || null;
    const sql = `SELECT r.reply_id, r.user_id, r.post_id, r.comment, r.totalVotes, r.createdAt, u.role, u.avatar
    FROM replies r JOIN users u ON r.user_id = u.email 
    WHERE reply_id='${reply_id}';`;
    con.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send({error:'Error getting the reply'});
        }else{
            if(result[0]){
                console.log("Result: ",result[0]);
                res.status(200).send(result[0]);
            }else{
                res.status(404).send({error:'Reply could not be found'});
            }
        }
      });
}

// delete a reply 
const deleteReply = (req,res)=>{

    const reply_id = req.params.reply_id || null;
    const sql = `DELETE FROM replies WHERE reply_id='${reply_id}';`;
    con.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send({error:'Error deleting the reply'});
        }else{
            if(result.affectedRows>0){
                console.log("Result: ",result);
                res.status(200).send('Reply successfully deleted');
            }else if(result.affectedRows=0){
                res.status(400).send({error:'Reply could not be deleted'});
            }
        }
    });
}

// update a reply (comment)
const updateReply = (req,res)=>{
    
    const reply_id = req.body.reply_id || null;
    const comment = req.body.comment || null;

    const sql = `UPDATE replies SET comment='${comment}' WHERE reply_id='${reply_id}';`;
    con.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send({error:'Error updating the reply'});
        }else{
            if(result.affectedRows>0){
                console.log("Result: ",result);
                res.status(200).send('Reply successfully updated');
            }else if(result.affectedRows=0){
                res.status(400).send({error:'Reply could not be updated'});
            }
        }
    });
}

// upvote a reply
const upvote = async (req,res)=>{
    
    const user_id = req.body.user_id || null;
    const reply_id = req.body.reply_id || null;
    const reply = await getReplyFun(reply_id); // get reply
    const vote = await votes.getVote(user_id,reply_id); // get user's already existing vote (if there is one) on the reply

    // if reply was found
    if(reply){
        let voted = false;
        let totalVotesNew;
        //if user has already voted the reply 
        if(vote){
            // if vote is negative or neutral
            if(vote.vote==-1 || vote.vote==0){
                voted = await votes.updateVote(vote.vote_id,1); // update vote to positive
                totalVotesNew = vote.vote==0?reply.totalVotes+1:reply.totalVotes+2; // if vote was negative add +2 to totalVotes, else if vote was neutral add 1 vote
            }else if(vote.vote==1){ // already upvoted
                voted = await votes.updateVote(vote.vote_id,0); // update vote to neutral
                totalVotesNew = reply.totalVotes-1; // remove a vote from total votes
            }
        // if user has not already voted the reply
        }else{
            voted = await votes.createVote(user_id,reply_id,1); // create the vote as positive 
            totalVotesNew = reply.totalVotes+1 // add positive vote to totalVotes
        }

        // if voted (no errors while creating/updating the user's vote)
        if(voted){
            // update reply to the new totalVotes
            const sql = `UPDATE replies SET totalVotes='${totalVotesNew}' WHERE reply_id='${reply_id}';`;
            con.query(sql, (err, result) => {
                if (err) {
                    console.log(err);
                    res.status(500).send({error:'Error upvoting the reply'});
                }else{
                    if(result.affectedRows>0){
                        console.log("Result: ",result);
                        res.status(200).send('Reply successfully upvoted');
                    }else if(result.affectedRows=0){
                        console.log('0')
                        res.status(400).send({error:'Reply could not be upvoted'});
                    }
                }
            });
        }else{
            console.log('reply`s vote could not be updated')
            res.status(400).send({error:'Reply could not be upvoted'});
        }
    }else{
        console.log('reply not found')
        res.status(403).send({error:'Reply could not be found'});
    }
}

// downvote a reply
const downvote = async (req,res)=>{
    
    const user_id = req.body.user_id || null;
    const reply_id = req.body.reply_id || null;
    const reply = await getReplyFun(reply_id); // get reply
    const vote = await votes.getVote(user_id,reply_id); // get user's already existing vote (if there is one) on the reply

    // if reply was found
    if(reply){
        let voted = false;
        let totalVotesNew;
        //if user has already voted the reply 
        if(vote){
            // if vote is positive or neutral
            if(vote.vote==1 || vote.vote==0){
                voted = await votes.updateVote(vote.vote_id,-1); // update vote to negative
                totalVotesNew = vote.vote==0?reply.totalVotes-1:reply.totalVotes-2; // if vote was positive remove -2 to totalVotes, else if vote was neutral remove 1 vote
            }else if(vote.vote==-1){ // already downvoted 
                voted = await votes.updateVote(vote.vote_id,0); // update vote to neutral
                totalVotesNew = reply.totalVotes+1; // add a vote to total votes
            }
        // if user has not already voted the reply
        }else{
            voted = await votes.createVote(user_id,reply_id,-1); // create the vote as negative 
            totalVotesNew = reply.totalVotes-1 // add negative vote to totalVotes 
        }

        // if voted (no errors while creating/updating the user's vote)
        if(voted){
            // update reply to the new totalVotes
            const sql = `UPDATE replies SET totalVotes='${totalVotesNew}' WHERE reply_id='${reply_id}';`;
            con.query(sql, (err, result) => {
                if (err) {
                    console.log(err);
                    res.status(500).send({error:'Error downvoting the reply'});
                }else{
                    if(result.affectedRows>0){
                        console.log("Result: ",result);
                        res.status(200).send('Reply successfully downvoted');
                    }else if(result.affectedRows=0){
                        res.status(400).send({error:'Reply could not be downvoted'});
                    }
                }
            });
        }else{
            console.log('reply`s vote could not be updated')
            res.status(400).send({error:'Reply could not be downvoted'});
        }
    }else{
        res.status(404).send({error:'Reply could not be found'});
    }
}

// get a reply by it's id
async function getReplyFun(reply_id) {

    const sql = `SELECT * FROM replies WHERE reply_id=${reply_id};`;
    const promisePool = pool.promise();
    let rows = await promisePool.query(sql);
    return rows[0][0];
}

module.exports = {
    createReply,
    getReply,
    deleteReply,
    updateReply,
    upvote,
    downvote
}