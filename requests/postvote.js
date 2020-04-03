async function getVote(user,post){

    const sql = `SELECT * FROM postvotes WHERE user_id='${user}' AND post_id=${post};`;
    const promisePool = pool.promise();
    let rows = await promisePool.query(sql);
    console.log('vote is :', rows[0][0])
    return rows[0][0];
}

async function createVote(user,post,vote){

    const sql = `INSERT INTO postvotes (user_id,post_id,vote) VALUES ('${user}','${post}','${vote}');`;
    const promisePool = pool.promise();
    try{
        let rows = await promisePool.query(sql);
        console.log('creating vote : ',rows)
        if(rows && rows[0].affectedRows>0) return true;
        return false;
    }catch(err){
        console.log(err)
        return false;
    }
}

async function updateVote(vote_id,vote){

    const sql = `UPDATE postvotes SET vote='${vote}' WHERE vote_id='${vote_id}';`;
    const promisePool = pool.promise();
    try{
        let rows = await promisePool.query(sql);
        console.log('updating vote : ',rows)
        if(rows && rows[0].affectedRows>0) {
            console.log('affeeecteeeedd',rows[0].affectedRows)
            return true;
        }else{
            return false;  
        }
              
    }catch(err){
        console.log(err)
        return false;
    }
}

module.exports = {
    getVote,
    createVote,
    updateVote
}