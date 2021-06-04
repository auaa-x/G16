const User = require('../models/users');

function insert(req, res) {
    console.log('inserting user to MongoDB');
    let userData = req.body;
    if (userData == null) {
        res.status(403).send('No data sent!')
    }
    try {
        let user = new User({
            user_name: userData.username,
            room_id: userData.roomNo,
            image_path: userData.imageUrl,
            image_title: ' ',
            image_author: ' ',
            image_dp: ' '
        });
        console.log('received: ' + user);

        user.save((err, results) => {
            console.log(results);
            console.log(results._id);
            if (err) {
                res.status(500).send('Invalid data!');
            }
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
    console.log(userData);

    User.exists({
            user_name: userData.username,
            room_id: userData.roomNo,
            image_path: userData.imageUrl
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

exports.updatePanel = (req, res) => {
    console.log("Updating image info to mongo db...");
    let panelData = req.body;
    console.log(panelData);

    User.updateOne({
        room_id: panelData.roomNo,
        image_path: panelData.imageUrl},
        {
            $set : {
            image_title: panelData.imageTitle,
            image_dp: panelData.imageDp,
            image_author: panelData.imageAuthor
            }}, function(err) {
        if(err) {
            console.log(err);
        } else {
            console.log("Mongo db successfully updated.");
        }
    });

    // User.findOne({ 'room_id': panelData.roomNo}, 'image_path', function (err, user) {
    //     if (err) return handleError(err);
    //     // Prints "Space Ghost is a talk show host".
    //     console.log('title: ' + user.image_path);
    // });
}

