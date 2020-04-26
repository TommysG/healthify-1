const user = require('../requests/user');

function route(app) {
    app.get('/api/user/:email', user.getUser); // get a user (obj) by his email
    app.post('/api/user', user.createUser); // create a new user (sign up)
    app.put('/api/user', user.updateUser); // update an existing user
    app.delete('/api/user/:email', user.deleteUser); // delete a user
    app.get('/api/users', user.getAllUsers); // get all users (array of objects)
    app.post('/api/validate', user.validatePwd); // validate if given password is correct (to loggin)
    app.post('/api/changePassword', user.changePwd); // change existing password        
}

module.exports = route;