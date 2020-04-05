const mysql = require('mysql2');
require('dotenv/config');

const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;
const DB_HOST = process.env.DB_HOST;

const con = mysql.createConnection({
    database: DB_NAME,
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASS
});

const pool = mysql.createPool({
    database: DB_NAME,
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASS
});

global.con = con;
global.pool = pool;

const connect = async ()=>{
    try{
        con.connect();
        return true;
    }catch(err){
        console.log(err);
        return false;
    }
}

module.exports = connect;