async function getVote(user,reply){

    const sql = `SELECT * FROM replyvotes WHERE user_id='${user}' AND reply_id='${reply}';`;
    const promisePool = pool.promise();
    let rows = await promisePool.query(sql);
    // console.log('vote is :', rows[0][0])
    return rows[0][0];
}

async function createVote(user,reply,vote){

    const sql = `INSERT INTO replyvotes (user_id,reply_id,vote) VALUES ('${user}','${reply}','${vote}');`;
    const promisePool = pool.promise();
    try{
        let rows = await promisePool.query(sql);
        console.log('creating vote : ',rows)
        return true;
    }catch(err){
        console.log(err)
        return false;
    }
}

async function updateVote(vote_id,vote){

    const sql = `UPDATE replyvotes SET vote='${vote}' WHERE vote_id='${vote_id}';`;
    const promisePool = pool.promise();
    try{
        let rows = await promisePool.query(sql);
        console.log('updating vote : ',rows)
        if(rows && rows[0].affectedRows>0) {
            return true;
        }else{
            return false;
        }
        
    }catch(err){
        console.log('...')
        console.log(err)
        return false;
    }
}

module.exports = {
    getVote,
    createVote,
    updateVote
}