const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Users = new Schema(
    {
        user_name: {type: String, required: true, max: 100},
        room_id: {type: String, required: true, max: 100},
        image_path: {type: String}
    }
);

Users.set('toObject', {getters: true, virtuals: true});

let userModel = mongoose.model('Users', Users );

module.exports = userModel;