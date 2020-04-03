const votes = require('./replyvote');

const createReply = async (req,res)=>{

    const user_id = req.body.user_id || null;
    const post_id = req.body.post_id || null;
    const comment = req.body.comment || null;
    const timestamp = (new Date()).toString();

    const sql = `INSERT INTO replies (user_id,post_id,comment,timestamp) VALUES ('${user_id}','${post_id}','${comment}','${timestamp}');`;

    console.log('//////')
    console.log(sql)
    con.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send('Reply could not be created');
        }else{
            if(result.affectedRows>0){
                console.log("Result: ",result);
                res.status(201).send('Reply successfully created');
            }else{
                res.status(400).send('Reply could not be created');
            }
        }
    });
}

const getReply = async (req,res)=>{
    const reply_id = req.params.reply_id || null;
    const sql = `SELECT * FROM replies WHERE reply_id='${reply_id}';`;

    console.log('//////')
    console.log(sql)
    con.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send('Error getting the reply');
        }else{
            if(result[0]){
                console.log("Result: ",result[0]);
                res.status(200).send(result[0]);
            }else{
                res.status(404).send('Reply could not be found');
            }
        }
      });
}

const deleteReply = (req,res)=>{
    const reply_id = req.params.reply_id || null;
    const sql = `DELETE FROM replies WHERE reply_id='${reply_id}';`;

    console.log('//////')
    console.log(sql)
    con.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send('Error deleting the reply');
        }else{
            if(result.affectedRows>0){
                console.log("Result: ",result);
                res.status(200).send('Reply successfully deleted');
            }else{
                res.status(400).send('Reply could not be deleted');
            }
        }
    });
}

const updateReply = (req,res)=>{
    
    const reply_id = req.body.reply_id || null;
    const comment = req.body.comment || null;

    const sql = `UPDATE replies SET comment='${comment}' WHERE reply_id='${reply_id}';`;
    con.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send('Error updating the reply');
        }else{
            if(result.affectedRows>0){
                console.log("Result: ",result);
                res.status(200).send('Reply successfully updated');
            }else{
                res.status(400).send('Reply could not be updated');
            }
        }
      });
}

const upvote = async (req,res)=>{
    
    const user_id = req.body.user_id || null;
    const reply_id = req.body.reply_id || null;
    const reply = await getReplyFun(reply_id);
    const vote = await votes.getVote(user_id,reply_id);
    console.log('vote : ',vote)
    console.log('reply : ',reply)
    if(reply){
        let voted = false;
        let totalVotesNew;
        if(vote){
            if(vote.vote==-1 || vote.vote==0){
                voted = await votes.updateVote(vote.vote_id,1);
                totalVotesNew = vote.vote==0?reply.totalVotes+1:reply.totalVotes+2; // if from -vote to +vote -> totalVotes +2, if from 0vote to +vote -> totalVotes +1
            }else if(vote.vote==1){ // already upvoted --> remove vote
                voted = await votes.updateVote(vote.vote_id,0);
                totalVotesNew = reply.totalVotes-1; // remove a +vote -> totalVotes -1
            }
        }else{
            voted = await votes.createVote(user_id,reply_id,1);
            totalVotesNew = reply.totalVotes+1 // from 0vote to +vote -> totalVotes +1
        }

        if(voted){
            const sql = `UPDATE replies SET totalVotes='${totalVotesNew}' WHERE reply_id='${reply_id}';`;
            con.query(sql, (err, result) => {
                if (err) {
                    console.log(err);
                    res.status(500).send('Error upvoting the reply');
                }else{
                    if(result.affectedRows>0){
                        console.log("Result: ",result);
                        res.status(200).send('Reply successfully upvoted');
                    }else{
                        console.log('0')
                        res.status(400).send('Reply could not be upvoted');
                    }
                }
            });
        }else{
            console.log('reply`s vote could not be updated')
            res.status(400).send('Reply could not be upvoted');
        }
    }else{
        console.log('reply not found')
        res.status(403).send('Reply could not be found');
    }
}

const downvote = async (req,res)=>{
    
    const user_id = req.body.user_id || null;
    const reply_id = req.body.reply_id || null;
    const reply = await getReplyFun(reply_id);
    const vote = await votes.getVote(user_id,reply_id);
    console.log('vote : ',vote)
    console.log('reply : ',reply)

    if(reply){
        let voted = false;
        let totalVotesNew;
        if(vote){
            if(vote.vote==1 || vote.vote==0){
                voted = await votes.updateVote(vote.vote_id,-1);
                totalVotesNew = vote.vote==0?reply.totalVotes-1:reply.totalVotes-2; // if from +vote to -vote -> totalVotes -2, if from 0vote to -vote -> totalVotes -1
            }else if(vote.vote==-1){ // already downvoted --> remove vote
                voted = await votes.updateVote(vote.vote_id,0);
                totalVotesNew = reply.totalVotes+1; // remove a -vote -> totalVotes +1
            }
        }else{
            voted = await votes.createVote(user_id,reply_id,-1);
            totalVotesNew = reply.totalVotes-1 // from 0vote to -vote -> totalVotes -1
        }

        if(voted){
            const sql = `UPDATE replies SET totalVotes='${totalVotesNew}' WHERE reply_id='${reply_id}';`;
            con.query(sql, (err, result) => {
                if (err) {
                    console.log(err);
                    res.status(500).send('Error downvoting the reply');
                }else{
                    if(result.affectedRows>0){
                        console.log("Result: ",result);
                        res.status(200).send('Reply successfully downvoted');
                    }else{
                        res.status(400).send('Reply could not be downvoted');
                    }
                }
            });
        }else{
            console.log('reply`s vote could not be updated')
            res.status(400).send('Reply could not be downvoted');
        }
    }else{
        res.status(404).send('Reply could not be found');
    }
}

async function getReplyFun(reply_id) {

    const sql = `SELECT * FROM replies WHERE reply_id=${reply_id};`;
    const promisePool = pool.promise();
    let rows = await promisePool.query(sql);
    // console.log('reply is :', rows[0][0])
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