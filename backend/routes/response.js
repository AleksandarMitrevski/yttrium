var express = require('express');
var router = express.Router();

var responses_controller = require('../controllers/responsesController');

router.get('/:id', responses_controller.get);
router.get('/survey/:id', responses_controller.list);
router.post('/:id', responses_controller.create);

module.exports = router;
