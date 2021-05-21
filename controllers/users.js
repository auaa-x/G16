const User = require('../models/users');

function insert(req, res) {
    console.log('inserting');
    let userData = req.body;
    if (userData == null) {
        res.status(403).send('No data sent!')
    }
    try {
        let user = new User({
            user_name: userData.username,
            room_id: userData.roomNo,
            image_path: userData.pic
        });
        console.log('received: ' + user);

        user.save((err, results) => {
            console.log(results._id);
            if (err)
                res.status(500).send('Invalid data!');

            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(user));
        });
    } catch (e) {
        res.status(500).send('error ' + e);
    }
}

exports.checkExist = (req, res) => {
    console.log("Checking user existence...");
    let userData = req.body;

    User.exists({
            user_name: userData.username,
            room_id: userData.roomNo,
            image_path: userData.pic
        },
        function (err, exist = false) {
            if (err) {
                console.error(err);
            }
            if (exist){
                res.status(302).send('User already exist');
            } else{
                insert(req, res);
            }
        });


}

