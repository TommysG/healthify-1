const createUser = async (req,res)=>{

    const email = req.body.email || null;
    const username = req.body.username || null;
    const pwd = req.body.pwd || null;
    const name = req.body.name || null;
    const surname = req.body.surname || null;
    const role = req.body.role || null;
    const avatar = req.body.avatar || null;

    const sql = `INSERT INTO users VALUES ('${email}','${username}','${pwd}','${name}','${surname}','${role}','${avatar}');`;

    console.log('//////')
    console.log(sql)
    con.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send('User could not be created');
        }else{
            if(result.affectedRows>0){
                console.log("Result: ",result);
                res.status(201).send('User successfully created');
            }else{
                res.status(400).send('User could not be created');
            }
        }
    });
}

const getUser = async (req,res)=>{
    const email = req.params.user;
    const sql = `SELECT * FROM users WHERE email='${email}';`;

    console.log('//////')
    console.log(sql)
    con.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send('Error getting the user');
        }else{
            if(result[0]){
                console.log("Result: ",result[0]);
                res.status(200).send(result[0]);
            }else{
                res.status(404).send('User could not be found');
            }
        }
      });
}

const deleteUser = (req,res)=>{
    const email = req.params.user;
    const sql = `DELETE FROM users WHERE email='${email}';`;

    console.log('//////')
    console.log(sql)
    con.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send('Error deleting the user');
        }else{
            if(result.affectedRows>0){
                console.log("Result: ",result);
                res.status(200).send('User successfully deleted');
            }else{
                res.status(400).send('User could not be deleted');
            }
        }
    });
}

const updateUser = (req,res)=>{
    const email = req.body.email || null;
    const username = req.body.username || null;
    const pwd = req.body.pwd || null;
    const name = req.body.name || null;
    const surname = req.body.surname || null;
    const role = req.body.role || null;
    const avatar = req.body.avatar || null;

    const sql = `UPDATE users SET username='${username}', pwd='${pwd}', name='${name}', surname='${surname}', role='${role}', avatar='${avatar}' WHERE email='${email}';`;
    con.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send('Error updating the user');
        }else{
            if(result.affectedRows>0){
                console.log("Result: ",result);
                res.status(200).send('User successfully updated');
            }else{
                res.status(400).send('User could not be updated');
            }
        }
      });
}

const getAllUsers = (req,res)=>{
    const sql = `SELECT * FROM users;`;

    console.log('//////')
    console.log(sql)
    con.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send('Error getting the users data');
        }else{
            if(result[0]){
                console.log("Result: ",result);
                res.status(200).send(result);
            }else{
                res.status(404).send('Users data could not be found');
            }
        }
      });
}

module.exports = {
    createUser,
    getUser,
    deleteUser,
    updateUser,
    getAllUsers
}