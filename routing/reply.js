const reply = require('../requests/reply');

function route(app){
    app.post('/api/reply', reply.createReply); // create a new reply
    app.get('/api/reply/:reply_id', reply.getReply); // get a reply (obj) by its id
    app.put('/api/reply', reply.updateReply); // update a reply
    app.delete('/api/reply/:reply_id', reply.deleteReply); // delete a reply
    app.post('/api/upvoteReply', reply.upvote); // upvote a reply
    app.post('/api/downvoteReply', reply.downvote); // downvote a reply
}

module.exports = route;