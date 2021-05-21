var express = require('express');
var router = express.Router();

var user = require('../controllers/users');
var initDB = require('../controllers/init');
initDB.init();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/add', user.checkExist);

module.exports = router;
