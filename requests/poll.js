const promisePool = pool.promise();

async function createPoll(req,res){

    // request body
    const poll = req.body.poll || null;
    const mail = req.body.mail || null;
    const answers = req.body.answers || [];

    if(poll==null||mail==null){
        res.status(400).send({error:'Invalid input'});
    }else{
        try {
            // create poll
            let sql = `INSERT INTO polls (mail, poll) VALUES ('${mail}','${poll}');`;
            let rows = await promisePool.query(sql);
            let pollId = rows[0].insertId;

            // if poll is created successfully with id : insetId 
            if(pollId){
                //create poll's ansers
                for(let answer of answers){
                    sql = `INSERT INTO polls_answers (poll_id, answer) VALUES ('${pollId}','${answer}');`;
                    rows = await promisePool.query(sql);
                }
                res.send('Poll created successfully');
            }else{
                res.status(400).send({error:'Poll could not be created'});
            }
        }
        catch (err) { 
            console.log(err)
            // other error thrown by the validator
            res.status(400).send({error:'Poll could not be created'});
        }

    }
}


// get a poll as object by its id
function getPoll (req,res){

    const poll_id = req.params.poll_id;
    let sql = `SELECT p.poll_id, p.mail, p.poll FROM polls as p WHERE p.poll_id='${poll_id}';`;
    con.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send({error:'Error getting the poll'});
        }else{
            if(result[0]){
                let poll  = result[0]
                sql = `SELECT pa.polls_answers_id, pa.answer FROM polls_answers as pa WHERE pa.poll_id='${poll_id}';`;
                con.query(sql, (err, result) => {
                    if (err) {
                        console.log(err);
                        res.status(500).send({error:'Error getting the poll'});
                    }else{
                        poll.answers=result;
                        res.status(200).send({poll})
                    }
                })
                console.log("Result: ",result[0]);
                // res.status(200).send(result[0]);
            }else{
                res.status(404).send({error:'poll could not be found'});
            }
        }
    });
}


// update a user's username, name, surname, role or avatar
async function updatePoll(req,res){
    const poll = req.body.poll || null;
    const answers = req.body.answers || [];
    const poll_id = req.body.poll_id || null;

    if(!poll_id||!poll||!answers){
        res.status(400).send({error:'Invalid input'});
    }else{
        try {
            let sql = `UPDATE polls SET poll='${poll}' WHERE poll_id='${poll_id}';`;
            let rows = await promisePool.query(sql);
            let updated = rows[0]?rows[0].affectedRows:false
            if(updated){
                // update answers
                for(let answer of answers){
                    sql = `UPDATE polls_answers SET answer='${answer.answer}' WHERE polls_answers_id='${answer.polls_answers_id}';`;
                    rows = await promisePool.query(sql);
                }
                res.send('Poll successfully updated')
            }
        }catch(err){
            console.log(err)
            res.status(400).send({error:'Poll could not be updated'});
        }
    }
}

// delete a poll by its id
function deletePoll(req,res){

    const poll_id = req.params.poll_id;
    const sql = `DELETE FROM polls WHERE poll_id='${poll_id}';`;

    con.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send({error:'Error deleting the poll'});
        }else{
            if(result.affectedRows>0){
                console.log("Result: ",result);
                res.status(200).send('poll successfully deleted');
            }else if(result.affectedRows=0){
                console.log('returning error')
                res.status(400).send({error:'poll could not be deleted'});
            }
        }
    });
}

// get all users' profiles
async function getAllUserPolls(req,res){

    const mail = req.params.mail || null;
    console.log(mail)
    const sql = `SELECT * FROM polls WHERE mail='${mail}';`;
    con.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send({error:'Error getting the users polls'});
        }else{
            console.log('result : ',result)
            if(result[0]){
                console.log("Result: ",result);
                res.status(200).send(result);
            }else{
                res.status(404).send({error:'Users polls could not be found'});
            }
        }
    });
}

// get all polls
async function getAllPolls (req,res){

    const sql = `SELECT * FROM polls;`;
    con.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send({error:'Error getting the polls'});
        }else{
            if(result[0]){
                console.log("Result: ",result);
                res.status(200).send(result);
            }else{
                res.status(404).send({error:'polls could not be found'});
            }
        }
    });
}

// vote in a poll
async function vote(req,res){
    // request body
    const poll_id = req.body.poll_id || null;
    const username = req.body.username || null;
    const polls_answers_id = req.body.polls_answers_id || null;

    if(!poll_id||!username||!polls_answers_id){
        res.status(400).send({error:'invalid input'})
    }else{
        try {
            let voted = await hasVoted(req);
            if(!voted){
                let sql = `INSERT INTO polls_votes SET username='${username}', poll_id='${poll_id}', polls_answers_id='${polls_answers_id}';`;
                let rows = await promisePool.query(sql);
                let updated = rows[0]?rows[0].affectedRows:false;
                if(updated){
                    res.send('Poll successfully voted')
                }else{
                    res.status(400).send({error:'Poll could not be voted'});
                }
            }else{
                res.status(400).send({error:'User has already voted'});
            }
        }catch(err){
            console.log(err)
            res.status(400).send({error:'Poll could not be voted'});
        }
    }
}

async function getUserVote(req,res){

    // request body
    const poll_id = req.body.poll_id || null;
    const username = req.body.username || null;

    if(!poll_id||!username){
        res.status(400).send('invalid input')
    }else{
        try {
            let sql = `SELECT polls_votes_id as answer_id FROM polls_votes WHERE username='${username}' AND poll_id='${poll_id}';`;
            let rows = await promisePool.query(sql);
            let anser = rows[0][0];
            console.log(anser);
            if(anser){
                res.send(anser)
            }else{
                res.status(404).send({error:'User has not voted'})
            }
        }catch(err){
            console.log(err)
            res.status(400).send({error:'Poll could not be voted'});
        }
    }
}

async function getPollVotes(req,res){

    // request body
    const poll_id = req.params.poll_id || null;

    const sql = `SELECT * FROM v_polls WHERE poll_id='${poll_id}';`;
    con.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send({error:'Error getting the poll'});
        }else{
            if(result.length>0){
                console.log("Result: ",result);
                res.status(200).send(result);
            }else if(result.length=0){
                res.status(404).send({error:'poll could not be found'});
            }
        }
    });
}

async function hasVoted(req){

    // request body
    const poll_id = req.body.poll_id || null;
    const username = req.body.username || null;

    try {
        let sql = `SELECT polls_votes_id as answer_id FROM polls_votes WHERE username='${username}' AND poll_id='${poll_id}';`;
        let rows = await promisePool.query(sql);
        let anser = rows[0][0];
        console.log(anser);
        if(anser){
            return true;
        }else{
            return false;
        }
    }catch(err){
        return true;
    }
    
}

module.exports = {
    createPoll,
    getPoll,
    updatePoll,
    deletePoll,
    getAllUserPolls,
    getAllPolls,
    vote,
    getUserVote,
    getPollVotes
}