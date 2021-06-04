var express = require('express');
var router = express.Router();
const fs = require('fs');
const fetch = require('node-fetch');
const path = require('path');

var user = require('../controllers/users');
var initDB = require('../controllers/init');
initDB.init();

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

router.post('/add', function (req, res, next) {
    let userData = req.body;
    if (userData == null) {
        res.status(403).send('No data sent!')
    }

    const imageUrl = userData.imageUrl;

    try {
        user.checkExist(userData, (err, exist = false) => {
            if (err) {
                throw err;
            }
            if (!exist) {
                fetchImg(imageUrl).then((imagePath) => {
                    userData.imagePath = imagePath;
                    user.insert(userData, (insertErr, user) => {
                        if (insertErr) {
                            throw insertErr;
                        }
                        userData = user;
                    });
                })
            }
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(userData));
        });
    } catch (e) {
        res.status(500).send('Invalid data!');
    }
});

router.post('/updatePanel', user.updatePanel);

/**
 * fetch image by image url and then save to the local folder
 * @param imageUrl
 */
async function fetchImg(imageUrl) {
    const timestamp = Math.floor(Date.now() / 1000);

    let dir = __dirname + '/../';
    dir = path.join(dir, 'public/assets');
    const imagePath = `${dir}/${timestamp}.png`;
    let response = await fetch(imageUrl);
    let buffer = await response.buffer();

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, {
            recursive: true
        });
        console.log('Directory not found and created one.');
    }
    fs.writeFile(imagePath, buffer, () =>
        console.log('Image saved locally!'));
    console.log('Directory already exits.');

    return imagePath;
}

module.exports = router;
