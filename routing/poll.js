const poll = require('../requests/poll');

function route(app) {
    app.post('/api/poll', poll.createPoll); // create a new poll
    app.get('/api/poll/:poll_id', poll.getPoll); // get a poll (obj) with its ansers and votes
    app.put('/api/poll', poll.updatePoll); // update a poll
    app.delete('/api/poll/:poll_id', poll.deletePoll); // delete a poll
    app.get('/api/userPolls/:mail', poll.getAllUserPolls); // get all polls made by one user
    app.get('/api/allPolls', poll.getAllPolls); // get all polls
    app.post('/api/pollVote', poll.vote); // vote in a poll
    app.post('/api/userVote', poll.getUserVote); // get user's vote in a poll
    app.get('/api/pollVotes/:poll_id', poll.getPollVotes); // vote in a poll
}

module.exports = route;