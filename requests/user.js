const userSchema = require('../models/user'); // use to validate user requests

// create a new user
const createUser = async (req,res)=>{

    // request body
    const email = req.body.email || null;
    const username = req.body.username || null;
    const pwd = req.body.pwd || null;
    const repeatPwd = req.body.repeatPwd || null;
    const name = req.body.name || null;
    const surname = req.body.surname || null;
    const role = req.body.role || null;
    const avatar = req.body.avatar || null;
    const mediaConnected = req.body.mediaConnected==true?1:0;

    // check if email or username already exist in the db 
    const existingMailUN = await checkExisting(email,username);
    // if so, send appropriate message to the user 
    if(existingMailUN.flag){
        res.status(400).send({error:existingMailUN.message});
    }else{
        try {
            // validate structure of email, username, password, repeatPwd and role
            await userSchema.createUserSchema.validateAsync({ email,username, pwd, repeatPwd,role});
            const sql = `INSERT INTO users VALUES ('${email}','${username}','${pwd}','${name}','${surname}','${role}','${avatar}','${mediaConnected}');`;
            // make the query
            con.query(sql, (err, result) => {
                if (err) {
                    console.log(err);
                    res.status(500).send({error:'Internal Server Error. User could not be created'});
                }else{
                    if(result.affectedRows>0){
                        console.log("Result: ",result);
                        res.status(201).send('User successfully created');
                    }else if(result.affectedRows=0){
                        res.status(500).send({error:'Internal Server Error. User could not be created'});
                    }
                }
            });
        }
        catch (err) { 
            // validator will throw an error if password and repeat-password do not exist or exist and do not match 
            if(pwd && repeatPwd && pwd!==repeatPwd){
                res.status(400).send({error:'Passwords do not match'})
            }
            console.log(err)
            // other error thrown by the validator
            res.status(400).send({error:err.details[0].message});
        }
    }
}

// get a user as object by his email
const getUser = async (req,res)=>{

    const email = req.params.email;
    const sql = `SELECT email, username, name, surname, role, avatar, mediaConnected FROM users WHERE email='${email}';`;
    con.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send({error:'Error getting the user'});
        }else{
            if(result[0]){
                console.log("Result: ",result[0]);
                res.status(200).send(result[0]);
            }else{
                res.status(404).send({error:'User could not be found'});
            }
        }
    });
}

// delete a user by his email
const deleteUser = (req,res)=>{

    const email = req.params.email;
    const sql = `DELETE FROM users WHERE email='${email}';`;
    con.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send({error:'Error deleting the user'});
        }else{
            console.log(result)
            if(result.affectedRows>0){
                console.log("Result: ",result);
                res.status(200).send('User successfully deleted');
            }else if(result.affectedRows=0){
                res.status(400).send({error:'User could not be deleted'});
            }
        }
    });
}

// change a user's existing password
async function changePwd(req,res){

    const email = req.body.email || null;
    const oldPwd = req.body.oldPwd || null; // existing password
    const pwd = req.body.pwd || null;
    const repeatPwd = req.body.repeatPwd || null;

    // get user profile to validate existing password
    const promisePool = pool.promise();
    let sql = `SELECT * FROM users WHERE email='${email}';`;
    let rows = await promisePool.query(sql);
    console.log('reply is :', rows[0][0])
    // if user is found
    if(rows[0][0]){
        const user = rows[0][0];
        // if given current password is valid
        if(user.mediaConnected){
            res.status(403).send({error:'User has been connected via media and cannot perform the current action'})
        }else{
            if(oldPwd==user.pwd){
                // if new passwords match 
                if(pwd==repeatPwd){
                    // update the user's existing password 
                    sql= `UPDATE users SET pwd='${pwd}' WHERE email='${email}';`;
                    rows = await promisePool.query(sql);
                    console.log('reply is :', rows)
                    if(rows[0].affectedRows>0){
                        res.send('New password set successfully');
                    }else if(rows[0].affectedRows=0){
                        res.status(500).send({error:'Error setting new password'});
                    }
                }else{
                    res.status(400).send({error:'New passwords do not match'});
                }
            }else{
                res.status(400).send({error:'Invalid current password'});
            }
        }
    }else{
        res.status(400).send({error:'User could not be found'});
    }
}

// update a user's username, name, surname, role or avatar
async function updateUser(req,res){
    const email = req.body.email || null;
    const username = req.body.username || null;
    const name = req.body.name || null;
    const surname = req.body.surname || null;
    const role = req.body.role || null;
    const avatar = req.body.avatar || null;
    // check if another user with given username exist (username must be unique)
    const existingMailUN = await existingUsername(email,username);
    if(existingMailUN.flag){
        res.status(400).send({error:existingMailUN.message});
    }else{
        try {
            // validate user schema 
            await userSchema.updateUserSchema.validateAsync({username, role});
            const sql = `UPDATE users 
            SET username='${username}', name='${name}', surname='${surname}', role='${role}', avatar='${avatar}' 
            WHERE email='${email}';`;
            console.log(sql)
            // if no validation error run the query
            con.query(sql, (err, result) => {
                if (err) {
                    console.log(err);
                    res.status(500).send({error:'Error updating the user'});
                }else{
                    if(result.affectedRows>0){
                        console.log("Result: ",result);
                        res.status(200).send('User successfully updated');
                    }else if(result.affectedRows=0){
                        res.status(400).send({error:'User could not be updated'});
                    }
                }
            });
        }catch(err){
            console.log(err)
            res.status(400).send({error:err.details[0].message});
        }
    }
}

// get all users' profiles
async function getAllUsers(req,res){

    const sql = `SELECT email, username, name, surname, role, avatar, mediaConnected FROM users;`;
    con.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send({error:'Error getting the users data'});
        }else{
            if(result[0]){
                console.log("Result: ",result);
                res.status(200).send(result);
            }else{
                res.status(404).send({error:'Users data could not be found'});
            }
        }
      });
}

// validate user given password
async function validatePwd(req,res){

    const email = req.body.email;
    const pwd = req.body.pwd;

    const promisePool = pool.promise();
    const sql = `SELECT * FROM users WHERE email='${email}';`;
    let rows = await promisePool.query(sql);
    console.log('reply is :', rows[0][0])
    // if user is found check password validity
    if(rows[0][0]){
        let user = rows[0][0];
        if(user.mediaConnected){
            res.status(403).send({error:'User has been connected via media and cannot perform the current action'})
        }else{
            if(user.pwd==pwd){
                res.send(user);
            }else{
                res.status(403).send({error:'Invalid password'});
            }
        }
    }else{
        res.status(404).send({error:'User not found'});
    }
}

// check if email or username already exist in the db before creating a new user
async function checkExisting(email,username) {

    const promisePool = pool.promise();
    let sql = `SELECT * FROM users WHERE email='${email}';`;
    let rows = await promisePool.query(sql);
    console.log('reply is :', rows[0][0])
    if(rows[0][0]){
        return({flag:true,message:'A user with this email already exists'})
    }

    sql = `SELECT * FROM users WHERE username='${username}';`;
    rows = await promisePool.query(sql);
    console.log('reply is :', rows[0][0])
    if(rows[0][0]){
        return({flag:true,message:'A user with this username already exists'})
    }
    return({flag:false})
}

// check if there is already another user with the given username before updating a user's data
async function existingUsername(email,username) {
    const promisePool = pool.promise();
    let sql = `SELECT * FROM users WHERE username='${username} AND email IS NOT ${email}';`;
    let rows = await promisePool.query(sql);
    console.log('reply is :', rows[0][0])
    if(rows[0][0]){
        return({flag:true,message:'A user with this username already exists'})
    }
    return({flag:false})
}



module.exports = {
    createUser,
    getUser,
    deleteUser,
    updateUser,
    getAllUsers,
    validatePwd,
    changePwd
}