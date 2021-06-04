const User = require('../models/users');

exports.insert = (userData, callback) => {
    console.log('inserting user to MongoDB');
    let user = new User({
        user_name: userData.username,
        room_id: userData.roomNo,
        image_url: userData.imageUrl,
        image_path: userData.imagePath,
        image_title: ' ',
        image_author: ' ',
        image_dp: ' '
    });
    console.log('received: ' + user);

    user.save((err) => callback(err, user));
}

exports.checkExist = (userData, callback) => {
    console.log("Checking user existence...");

    User.exists({
            user_name: userData.username,
            room_id: userData.roomNo,
            image_url: userData.imageUrl
        }, callback);
}

exports.updatePanel = (req, res) => {
    console.log("Updating image info to mongo db...");
    let panelData = req.body;

    User.updateOne({
            room_id: panelData.roomNo,
            image_url: panelData.imageUrl
        },
        {
            $set: {
                image_title: panelData.imageTitle,
                image_dp: panelData.imageDp,
                image_author: panelData.imageAuthor
            }
        }, function (err) {
            if (err) {
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

