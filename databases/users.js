const mongoose = require('mongoose');
let ObjectId = require('mongodb').ObjectID;

const mongoDB = 'mongodb://localhost:27017/users';

mongoose.Promise = global.Promise;

try {
    connection = mongoose.connect(mongoDB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        checkServerIdentity: false,
    });
    console.log('connection to mongodb worked!');

// db.dropDatabase();

} catch (e) {
    console.log('error in db connection: ' + e.message);
}


// try{
//     var connection = mongoose.createConnection(mongoose);
//     console.log('connection to mongodb worked!');
//     } catch (e){
//     console.log('error in db connection: ' + e.message);
// }
