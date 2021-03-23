var express = require('express');
var router = express.Router();

/* GET home page. */
router.post('/join', function(req, res, next) {
    const {name, roomNo, imageUrl} = req.body;
    const roomId = `${roomNo}-${imageUrl}`;

    //@todo post roomId to socket.io to create room

    res.send({name, roomNo, roomId});
});

module.exports = router;
