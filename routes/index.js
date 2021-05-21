var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Image Browsing' });
});

router.post('/', function(req, res, next) {
  // do something w/ req.body or req.files
});
module.exports = router;
